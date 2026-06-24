// Copyright (C) 2023 The Qt Company Ltd.
// SPDX-License-Identifier: LicenseRef-Qt-Commercial OR BSD-3-Clause

import QtQml
import QtQuick
import QtQuick.Controls
import FilesystModule

Button {
    required property ApplicationWindow resizeWindow

    icon.width: 20; icon.height: 20
    anchors.right: parent.right
    anchors.bottom: parent.bottom
    rightPadding: 3
    bottomPadding: 3

    icon.source: "../icons/resize.svg"
    icon.color: hovered ? Colors.iconIndicator : Colors.icon

    background: null //Rectangle { color: "red" }
    checkable: false
    display: AbstractButton.IconOnly
    // onPressed: resizeWindow.startSystemResize(Qt.BottomEdge | Qt.RightEdge)

    // visible: resizeWindow.visibility !== Window.Maximized
    // enabled: resizeWindow.visibility !== Window.Maximized

    onClicked: {
        console.log("oncliecked ...")
        if (resizeWindow.visibility === Window.Maximized) {
            resizeWindow.visibility = Window.Windowed
            console.log("restore")
        } else {
            resizeWindow.visibility = Window.Maximized
            console.log("maximize")
        }
    }
}
