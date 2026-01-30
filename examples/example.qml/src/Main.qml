// Copyright (C) 2023 The Qt Company Ltd.
// SPDX-License-Identifier: LicenseRef-Qt-Commercial OR BSD-3-Clause
import QtQuick
import QtQuick.Controls.Basic
import QtQuick.Layouts
import Qt.labs.folderlistmodel

import FilesystModule

pragma ComponentBehavior: Bound

ApplicationWindow {
    id: root

    property bool expandPath: false
    property bool showLineNumbers: true
    property string currentFilePath: ""
    property int show_dir_file: 0

    width: 1100
    height: 600
    minimumWidth: 200
    minimumHeight: 100
    visible: true
    color: Colors.background
    flags: Qt.Window | Qt.FramelessWindowHint
    title: qsTr("File System Explorer")

    function getInfoText() : string {
        let out = root.currentFilePath
        if (!out)
            return qsTr("File System Explorer")
        return root.expandPath ? out : out.substring(out.lastIndexOf("/") + 1, out.length)
    }

    Doclientier{ id: doclient }

    Connections {
        target: doclient

        function onFileStatusChanged(path, success) {
            console.log("Update for:", path, "Success:", success);

            // Update the status in the object
            // 3 = Success, 4 = Failed (or use your custom logic)
            if (success) {
                fileListView.selectedPaths[path] = 3;
                console.log("OK", path)
            } else {
                fileListView.selectedPaths[path] = 4;
                console.log("Failed", path)
            }

            // Force the CheckBox/Icon in the delegate to re-draw
            fileListView.selecount++;
        }
    }

    menuBar: MyMenuBar {
        dragWindow: root
        infoText: root.getInfoText()
        MyMenu {
            title: qsTr("File")

            // Action {
            //     text: qsTr("Increase Font")
            //     shortcut: StandardKey.ZoomIn
            //     onTriggered: editor.text.font.pixelSize += 1
            // }
            // Action {
            //     text: qsTr("Decrease Font")
            //     shortcut: StandardKey.ZoomOut
            //     onTriggered: editor.text.font.pixelSize -= 1
            // }
            Action {
                text: qsTr("Upload")
                shortcut: StandardKey.Save
                onTriggered: () => {
                        console.log(`Uploading ${Object.keys(fileListView.selectedPaths).length} files ....`)
                        Object.keys(fileListView.selectedPaths).forEach(p => {
                            console.log(p, fileListView.selectedPaths[p]); });
                        doclient.push_files(fileListView.selectedPaths);
                    }
            }
            Action {
                text: root.showLineNumbers ? qsTr("Toggle Line Numbers OFF")
                                           : qsTr("Toggle Line Numbers ON")
                shortcut: "Ctrl+L"
                onTriggered: root.showLineNumbers = !root.showLineNumbers
            }
            Action {
                text: root.expandPath ? qsTr("Toggle Short Path")
                                      : qsTr("Toggle Expand Path")
                enabled: root.currentFilePath
                onTriggered: root.expandPath = !root.expandPath
            }
            Action {
                text: qsTr("Reset Filesystem")
                enabled: sidebar.currentTabIndex === 1
                onTriggered: fileSystemView.rootIndex = undefined
            }
            Action {
                text: qsTr("Exit")
                onTriggered: Qt.exit(0)
                shortcut: StandardKey.Quit
            }
        }

        MyMenu {
            title: qsTr("Edit")

            Action {
                text: qsTr("Cut")
                shortcut: StandardKey.Cut
                enabled: editor.text.selectedText.length > 0
                onTriggered: editor.text.cut()
            }
            Action {
                text: qsTr("Copy")
                shortcut: StandardKey.Copy
                enabled: editor.text.selectedText.length > 0
                onTriggered: editor.text.copy()
            }
            Action {
                text: qsTr("Paste")
                shortcut: StandardKey.Paste
                enabled: editor.text.canPaste
                onTriggered: editor.text.paste()
            }
            Action {
                text: qsTr("Select All")
                shortcut: StandardKey.SelectAll
                enabled: editor.text.length > 0
                onTriggered: editor.text.selectAll()
            }
            Action {
                text: qsTr("Undo")
                shortcut: StandardKey.Undo
                enabled: editor.text.canUndo
                onTriggered: editor.text.undo()
            }
        }
    }
    // Set up the layout of the main components in a row:
    // [ Sidebar, Navigation, Editor ]
    RowLayout {
        anchors.fill: parent
        spacing: 0

        // Stores the buttons that navigate the application.
        Sidebar {
            id: sidebar
            dragWindow: root
            Layout.preferredWidth: 50
            Layout.fillHeight: true
        }

        // Allows resizing parts of the UI.
        SplitView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            // Customized handle to drag between the Navigation and the Editor.
            handle: Rectangle {
                implicitWidth: 10
                color: SplitHandle.pressed ? Colors.color2 : Colors.background
                border.color: SplitHandle.hovered ? Colors.color2 : Colors.background
                opacity: SplitHandle.hovered || navigationView.width < 15 ? 1.0 : 0.0

                Behavior on opacity {
                    OpacityAnimator {
                        duration: 1400
                    }
                }
            }

            Rectangle {
                id: navigationView
                color: Colors.surface1
                SplitView.preferredWidth: 250
                SplitView.fillHeight: true
                // The stack-layout provides different views, based on the
                // selected buttons inside the sidebar.
                StackLayout {
                    anchors.fill: parent
                    currentIndex: sidebar.currentTabIndex

                    // Shows the help text.
                    Text {
                        text: qsTr("This example shows how to use and visualize the file system.\n\n"
                                 + "Customized Qt Quick Components have been used to achieve this look.\n\n"
                                 + "You can edit the files but they won't be changed on the file system.\n\n"
                                 + "Click on the folder icon to the left to get started.")
                        wrapMode: TextArea.Wrap
                        color: Colors.text
                    }

                    // Shows the files on the file system.
                    FilesysView {
                        id: fileSystemView
                        color: Colors.surface1
                        onFileClicked: path => {
                            root.currentFilePath = path
                            root.show_dir_file = 0
                        }
                        onFolderClicked: path => {
                            console.log(`Add some items in the list view ${path} ...`)
                            root.currentFilePath = path
                            root.show_dir_file = 1
                            // folderModel.folder = Qt.resolvedUrl("file:" + path)
                            fileListView.currentPath = Qt.resolvedUrl("file:" + path)
                        }
                    }
                }
            }

            // The main view that contains the editor.
            // Editor {
            //     id: editor
            //     showLineNumbers: root.showLineNumbers
            //     currentFilePath: root.currentFilePath
            //     SplitView.fillWidth: true
            //     SplitView.fillHeight: true
            // }
            Column {
                id: rightpan
                SplitView.fillWidth: true
                SplitView.fillHeight: true

                // Component 1:
                Rectangle {
                    id: gallery
                    visible: root.show_dir_file == 1
                    height: parent.height
                    width: parent.width
                    color: "transparent"
                    Rectangle {
                        id: folderbrief
                        height: 50
                        width: parent.width
                        color: "#20302050"
                        Text {
                            color: "lightgrey"
                            padding: 10
                            anchors.centerIn: rightpan;
                            // text: `This is a gallery: ${root.currentFilePath} : ${folderModel.folder} [${folderModel.count}]...`
                            text: `This is a gallery: ${root.currentFilePath} : ${root.currentFilePath} ["$folderModel.count"]...`
                        }
                    }

                    FileListView {
                        id: fileListView
                        anchors.top: folderbrief.bottom
                        height: parent.height - folderbrief.height
                        width: rightpan.width
                        currentPath: root.currentFilePath

                        onFileDoubleClicked: (path) => {
                            root.currentFilePath = path
                            root.show_dir_file = 0 // Switch to editor
                        }

                        onFolderDoubleClicked: (path) => {
                            root.currentFilePath = path
                            root.show_dir_file = 1 // Stay in gallery/folder view
                        }
                    }

                    /*
                    ListView {
                        id: filelist
                        // anchors.fill: gallery
                        anchors.top: folderbrief.bottom
                        height: rightpan.height
                        width: rightpan.width

                        model: FolderListModel {
                            id: folderModel
                            folder: root.currentFilePath
                            showDirs: true        // Show directories
                            showFiles: true       // Show regular files
                            // nameFilters: ["*"]    // Filter for all files
                        }
                        // model: ["red", "grey", "silver", "pink"]

                        delegate: Rectangle {
                            id: fileitem
                            width: filelist.width
                            height: 30
                            border.color: "#aaa"
                            color: "transparent"

                            required property string fileName
                            required property string filePath
                            required property string fileSuffix
                            required property string fileBaseName
                            required property bool fileIsDir

                            Text {
                                // anchors.centerIn: filelist
                                text: fileName
                                color: "white"
                                // text: fileName // Role provided by FolderListModel
                            }

                            MouseArea {
                                anchors.fill: fileitem
                                onClicked: {
                                    console.log("selected file:", filePath)
                                    console.log(`[Dir ${fileIsDir}]`, `[${fileSuffix}]`, fileBaseName)
                                }
                            }
                        }
                    }
                    */
                }

                // Component 2: Visible when showFirst is false
                Editor {
                    id: editor
                    visible: root.show_dir_file == 0
                    showLineNumbers: root.showLineNumbers
                    currentFilePath: root.currentFilePath
                    height: parent.height
                    width: parent.width
                }
            }

        }
    }

    ResizeButton {
        resizeWindow: root
    }
}
