import QtQuick
import QtQuick.Controls.Basic
import QtQuick.Layouts
import Qt.labs.folderlistmodel
import FilesystModule

Item {
    id: root

    // Define properties that Main.qml can access/bind to
    // property string currentPath: ""
    property alias currentPath: folderModel.folder

    // property var selectedIndices: []
    property var selectedPaths: ({})
    /** select paths is a set, which qml engine won't lisenting it's elements changes. */
    property int selecount: 0

    // Signals to communicate events back to the parent
    signal fileDoubleClicked(string path)
    signal folderDoubleClicked(string path)

    // Instantiate the C++ Handler
    FileHandler {
        id: cppHandler
    }

    function toggleSelection(path) {
        /*
        let current = [...selectedIndices]
        let pos = current.indexOf(index)
        if (pos > -1) current.splice(pos, 1)
        else current.push(index)
        selectedIndices = current
        */
        if (selectedPaths.hasOwnProperty(path)) {
            console.log("removing", path);
            delete selectedPaths[path];
        }
        else {
            console.log("adding", path);
            // selectedPaths[path] = 0;
            selectedPaths[path] = AppConstants.Synching;
        }
    }

    ListView {
        id: filelist
        anchors.fill: parent
        clip: true
        model: FolderListModel {
            id: folderModel
            // folder: root.currentPath
            showDirs: true
            showFiles: true
        }

        delegate: Rectangle {
            id: fileitem
            width: filelist.width
            height: 40
            // color: root.selectedIndices.includes(index) ? Colors.selection : "transparent"
            color: root.selectedPaths.hasOwnProperty(filePath) ? Colors.selection : "transparent"

            required property int index
            required property string fileName
            required property string filePath
            required property bool fileIsDir

            RowLayout {
                anchors.fill: parent
                anchors.leftMargin: 10
                spacing: 10

                CheckBox {
                    id: ckb
                    // checked: root.selectedIndices.includes(index)
                    // checked: root.selecount > 0 && (console.log(filePath, root.selectedPaths.has(filePath)) !== undefined || root.selectedPaths.has(filePath))
                    checked: root.selecount >= 0 && root.selectedPaths.hasOwnProperty(filePath)
                    onToggled: root.toggleSelection(filePath)
                    focusPolicy: Qt.NoFocus
                    // 1. The Box (Indicator)
                    indicator: Rectangle {
                        implicitWidth: 20
                        implicitHeight: 20
                        x: ckb.leftPadding
                        y: parent.height / 2 - height / 2
                        radius: ckb.checked ? 5 : 3
                        border.color: ckb.checked ? "#21ce2b" : "#109007"
                        color: "transparent"

                        // The Checkmark
                        Rectangle {
                            width: 12
                            height: 12
                            x: 4
                            y: 4
                            radius: 3
                            color: ckb.checked ? "#21ce2b" : "#109007"
                            visible: ckb.checked
                        }
                    }
                }

                Text {
                    text: fileName
                    color: Colors.text
                    Layout.fillWidth: true
                    verticalAlignment: Text.AlignVCenter
                }
            }

            MouseArea {
                anchors.fill: parent
                propagateComposedEvents: true
                onClicked: (mouse) => {
                    if (mouse.modifiers & Qt.ControlModifier) {
                        // root.toggleSelection(index);
                        root.toggleSelection(filePath);
                        // console.log('+', index, filePath, fileName);
                    } else {
                        // root.selectedIndices = [index];
                        // root.selectedPaths.clear();
                        root.selectedPaths = {};
                        root.selectedPaths[filePath] = AppConstants.Synching;
                        // console.log(index, filePath, fileName);
                    }
                    root.selecount++;
                    mouse.accepted = false;
                }

                onDoubleClicked: {
                    // 1. Call the C++ logic
                    cppHandler.on_double_click(filePath, fileIsDir);

                    // 2. Still notify the UI to update the view
                    if (fileIsDir) {
                        // root.selectedIndices = [];
                        root.selectedPaths = new Set();
                        folderModel.folder =  Qt.resolvedUrl("file:" + filePath);
                    }
                    else
                        root.fileDoubleClicked(filePath);
                }
            }
        }
    }
}
