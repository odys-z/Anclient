# About

This project is An Android application based on semantic-* and the extensions.

The app can running on Android accessing local files and synchronizing files with
[jserv.syncdoc](https://github.com/odys-z/semantic-jserv/tree/master/docsync.jserv).

<div>
<img src='docsphinx/res/01-img-picking.png' style="width: 9em; padding:0.4em"/>
<img src='docsphinx/res/02-images.png' style="width: 9em; padding:0.4em"/>
</div>

# Credits

- [fishwjy/MultiType-FilePicker](https://github.com/fishwjy/MultiType-FilePicker).

# Troubleshootings

1 start Huawei Pro 30 for debug and adb device shows nothing

see [stackoverflow](https://stackoverflow.com/a/53887437/7362888).

2 access local Storage

[stackoverflow](https://stackoverflow.com/a/54342155/7362888)

3 ajax CROS error

try of stackoverflow

[answer 1](https://stackoverflow.com/a/10567914/7362888)

[answer 2](https://stackoverflow.com/a/54342155/7362888)

4 AVD emulator terminated

try start emulator with CLI

```
    %android-sdk%/tools/emulator -avd -list-avds # for device name
    %android-sdk%/tools/emulator -avd device-name
    emulator: ERROR: Not enough space to create userdata partition. Available: ...
```
see [stackoverflow](https://stackoverflow.com/a/44931679)

to remove Android SDK system images (using a lot of disk space), uncheck the item
in SDK Manager. See [here](https://stackoverflow.com/a/34369232).


5 Download AVD system images failed

see [stackoverflow](https://stackoverflow.com/q/45686444)
