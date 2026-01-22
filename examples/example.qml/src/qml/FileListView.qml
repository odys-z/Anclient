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

    property var selectedIndices: []

    // Signals to communicate events back to the parent
    signal fileDoubleClicked(string path)
    signal folderDoubleClicked(string path)

    // Instantiate the C++ Handler
    FileHandler {
        id: cppHandler
    }

    function toggleSelection(index) {
        let current = [...selectedIndices]
        let pos = current.indexOf(index)
        if (pos > -1) current.splice(pos, 1)
        else current.push(index)
        selectedIndices = current
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
            color: root.selectedIndices.includes(index) ? Colors.selection : "transparent"

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
                    checked: root.selectedIndices.includes(index)
                    onToggled: root.toggleSelection(index)
                    focusPolicy: Qt.NoFocus
                    // 1. The Box (Indicator)
                    indicator: Rectangle {
                        implicitWidth: 26
                        implicitHeight: 26
                        x: control.leftPadding
                        y: parent.height / 2 - height / 2
                        radius: 3
                        border.color: ckb.down ? "#109012" : "#21be2b"
                        color: "transparent"

                        // The Checkmark
                        Rectangle {
                            width: 14
                            height: 14
                            x: 6
                            y: 6
                            radius: 2
                            color: ckb.down ? "#17a81a" : "#21be2b"
                            visible: ckb.checked
                        }
                    }
                }

                Text {
                    text: fileName // [cite: 47]
                    color: Colors.text // [cite: 28]
                    Layout.fillWidth: true
                    verticalAlignment: Text.AlignVCenter
                }
            }

            MouseArea {
                anchors.fill: parent
                propagateComposedEvents: true
                onClicked: (mouse) => {
                    if (mouse.modifiers & Qt.ControlModifier) {
                        root.toggleSelection(index)
                    } else {
                        root.selectedIndices = [index]
                    }
                    mouse.accepted = false
                }

                onDoubleClicked: {
                    // 1. Call the C++ logic
                    cppHandler.on_double_click(filePath, fileIsDir);

                    // 2. Still notify the UI to update the view
                    if (fileIsDir)
                        root.folderDoubleClicked(filePath);
                    else
                        root.fileDoubleClicked(filePath);
                }
            }
        }
    }
}
