/**
 * Credits to Adulik (arusikpaloyan), Audio player (forked at Code Sandbox),
 * https://codesandbox.io/s/audio-player-forked-lxuloi?file=/src/App.js
 */
import { grey, red, green, orange, blue } from "@material-ui/core/colors";
import { createTheme } from "@material-ui/core/styles";

/*
    Palette
*/
const palette = {
  //type: "dark",
  primary: { main: "#2040b0" },
  secondary: { main: "#F78E1E" },
  tertiary: {
    main: "#FFD200",
    dark: "#DFB200",
    light: "rgb(73 198 215)",
    contrastText: "#000000"
  },
  text: {
    //primary: "#231F20",
  },
  divider: grey[200],
  background: {},
  error: { main: red[500] },
  success: { main: green[500] },
  warning: { main: orange[500] },
  info: { main: blue[500] },
  action: {}
};

/*
    Typography
*/
const typography = {
  fontFamily: "Jost",
  fontWeightMedium: 400,
  body1: {
    fontSize: 18
  },
  body2: {
    fontSize: 14
  },
  h1: {
    fontSize: 36,
    textTransform: "uppercase",
    fontWeight: "bold",
    letterSpacing: 2,
    lineHeight: "reset"
  },
  h2: {
    fontSize: 24,
    textTransform: "uppercase",
    fontWeight: "bold",
    letterSpacing: 2
  },
  h3: {
    fontSize: 18,
    textTransform: "uppercase",
    fontWeight: "bold",
    letterSpacing: 2
  },
  h4: {
    fontSize: 14,
    textTransform: "uppercase",
    fontWeight: "bold",
    letterSpacing: 2
  },
  h5: {
    fontSize: 12,
    textTransform: "uppercase",
    fontWeight: "bold",
    letterSpacing: 2
  },
  h6: {
    fontSize: 10,
    textTransform: "uppercase",
    fontWeight: "bold",
    letterSpacing: 2
  },
  caption: {
    fontSize: 14
  },
  gutterBottom: {
    marginBottom: 32
  }
};

/*
    Shape
*/
const shape = {
  borderRadius: 5
};

/*
    Transitions
*/
const transitions = {
  duration: {
    enteringScreen: 500,
    leavingScreen: 500
    //complex: 1000,
    //short: 250,
    //shorter: 200,
    //shortest: 150,
    //standard: 300,
  }
};

/*
    Props
*/
const props = {
  MuiTabs: {
    indicatorColor: "primary"
  },
  MuiTextField: {
    variant: "outlined",
    size: "small"
  },
  MuiButton: {},
  MuiSelect: {
    margin: "dense",
    variant: "outlined"
  },
};

/*
    Overrides
*/
const overrides = {
  /*
        Target release: beyond MVP
        MuiSlider
    */

  MuiSlider: {
    root: {},

    thumb: {
      height: 20,
      width: 20,
      backgroundColor: "#fff",
      border: "2px solid currentColor",
      marginTop: -8,
      marginLeft: -10,
      "&:focus, &:hover, &$active": {
        boxShadow: "inherit",
        backgroundColor: "currentColor"
      }
    },
    active: {},
    valueLabel: {
      left: "calc(-50%)",
      top: -40
    },
    track: {
      height: 4,
      borderRadius: 2
    },
    rail: {
      height: 4,
      borderRadius: 2
    },
    mark: {
      width: 6,
      height: 6,
      position: "absolute",
      marginTop: -1,
      marginLeft: -1,
      borderRadius: 4,
      backgroundColor: "currentColor"
    },
    markLabel: {
      opacity: 0.5,
      "&Active": {
        opacity: 1
      },
      "&:nth-child(3n+2)": {
        transform: "translatex(0)"
      },
      "&:nth-last-child(2)": {
        transform: "translatex(-90%)"
      }
    }
  },
  // Narrowing spacing in the dropdown lists after icon
  MuiListItemIcon: {
    root: {
      minWidth: 40
    }
  },

  // Matching font size with body1
  MuiButton: {
    label: { fontSize: 18 },
    text: { textTransform: "none" },
    contained: { textTransform: "none" },
    outlined: { textTransform: "none" }
  },

  // Changing default table border to match divider color
  MuiTableCell: {
    root: {
      borderBottom: "1px solid " + palette.divider
    }
  },
  // Matching input font size with body1
  MuiInput: {
    fontSize: 18,
    root: { fontSize: 18 }
  },

  MuiStepper: {
    root: {
      background: "none",
      border: "none",
      padding: 0
    }
  },

  // Colors for Completed/Active icons in steppers
  MuiStepIcon: {
    root: {},
    completed: {
      color: palette.success.main + "!important"
    },
    active: {
      color: palette.warning.main + "!important"
    }
  },

  // Matching font size with body1
  MuiTab: {
    wrapper: {
      fontSize: 18,
      textTransform: "none"
    }
  },

  // Matching font size with body1
  MuiTooltip: {
    tooltip: { fontSize: 18 }
  },
  
  // Matching font size with body1
  MuiAlert: {
    root: { fontSize: 18 }
  },

  // Making progress indicator thicker
  MuiLinearProgress: {
    root: {
      height: "8px",
      borderRadius: shape.borderRadius
    },
    bar: { borderRadius: shape.borderRadius }
  },

  // Making progress indicator thicker and adding round caps
  MuiCircularProgress: {
    circle: { strokeLinecap: "round" }
  },

  // Matching font size with body1
  MuiChip: {
    label: { fontSize: 18 }
  }
};

export default createTheme({
  // title: "Regis project theme" as any,
  palette: palette,
  typography: typography as any,
  shape: shape,
  spacing: 8,
  transitions: transitions,
  props: props as any,
  overrides: overrides as any
});

/**
 * Elegant Themes, GPL, via Wikimedia Commons,
 * https://commons.wikimedia.org/wiki/File:Circle-icons-music.svg
 * , retrieved on Jul 28, 2023,
 */
export const audioSVG = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
version="1.1" x="0px" y="0px" viewBox="0 0 64 64" style="enable-background:new 0 0 64 64;" 
xml:space="preserve">
<style type="text/css">
	.st0{fill:#76C2AF;}
	.st1{opacity:0.2;}
	.st2{fill:#231F20;}
	.st3{fill:#FFFFFF;}
</style>
<g id="Layer_1">
	<g> <circle class="st0" cx="32" cy="32" r="32"/> </g>
	<g class="st1">
		<g>
			<path class="st2"
        d="M13.9,49.4c1.6,2.1,4.9,2.2,7.4,0.3c1-0.8,2.8-2.9,2.8-7.2V29.2l19-3.6V34c0,3-2.4,3.7-3.2,3.8
        c-0.1,0-0.1,0-0.2,0c0,0-0.1,0-0.1,0l0,0c-1,0.2-1.9,0.6-2.8,1.2c-2.5,1.9-3.2,5.1-1.6,7.2c1.6,2.1,4.9,2.2,7.4,0.3
        c1.3-1,2.5-2.8,2.5-5.7V18.5c0-1.2-1-1.8-2.1-1.5l-19.2,3.6C22.5,21,22,22.3,22,23.4v13c0,3-2.7,4.4-3.5,4.5c0,0-0.1,0-0.1,0
        c-0.1,0-0.2,0-0.2,0l0,0c-0.9,0.2-1.9,0.6-2.7,1.2C13,44.1,12.3,47.3,13.9,49.4z"/>
		</g>
	</g>
	<g>
		<g>
			<path class="st3" d="M13.9,47.4c1.6,2.1,4.9,2.2,7.4,0.3c1-0.8,2.8-2.9,2.8-7.2V27.2l19-3.6V32c0,3-2.4,3.7-3.2,3.8
        c-0.1,0-0.1,0-0.2,0c0,0-0.1,0-0.1,0l0,0c-1,0.2-1.9,0.6-2.8,1.2c-2.5,1.9-3.2,5.1-1.6,7.2c1.6,2.1,4.9,2.2,7.4,0.3
        c1.3-1,2.5-2.8,2.5-5.7V16.5c0-1.2-1-1.8-2.1-1.5l-19.2,3.6C22.5,19,22,20.3,22,21.4v13c0,3-2.7,4.4-3.5,4.5c0,0-0.1,0-0.1,0
        c-0.1,0-0.2,0-0.2,0l0,0c-0.9,0.2-1.9,0.6-2.7,1.2C13,42.1,12.3,45.3,13.9,47.4z"/>
		</g>
	</g>
</g>
</svg>`