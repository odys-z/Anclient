import React from "react";
import { forwardRef } from 'react';
import { createTheme, responsiveFontSizes } from "@material-ui/core/styles";

import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import Close from '@material-ui/icons/Close';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
import StarBorder from '@material-ui/icons/StarBorder';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';

import FormatLineSpacingIcon from '@material-ui/icons/FormatLineSpacing';
import GridOnIcon from '@material-ui/icons/GridOn';

export const JsampleIcons = {
  Add: forwardRef<SVGSVGElement>((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef<SVGSVGElement>((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef<SVGSVGElement>((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef<SVGSVGElement>((props, ref) => <DeleteOutline {...props} ref={ref} />),
  Close: forwardRef<SVGSVGElement>((props, ref) => <Close {...props} ref={ref} />),
  DetailPanel: forwardRef<SVGSVGElement>((props, ref) => <ChevronRight {...props} ref={ref} />),
  Edit: forwardRef<SVGSVGElement>((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef<SVGSVGElement>((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef<SVGSVGElement>((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef<SVGSVGElement>((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef<SVGSVGElement>((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef<SVGSVGElement>((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef<SVGSVGElement>((props, ref) => <ChevronLeft {...props} ref={ref} />),
  ResetSearch: forwardRef<SVGSVGElement>((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef<SVGSVGElement>((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef<SVGSVGElement>((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef<SVGSVGElement>((props, ref) => <Remove {...props} ref={ref} />),

  ItemCollapse: forwardRef<SVGSVGElement>((props, ref) => <FormatLineSpacingIcon {...props} ref={ref} />),
  Worksheet: forwardRef<SVGSVGElement>((props, ref) => <GridOnIcon {...props} ref={ref} />),

  ViewColumn: forwardRef<SVGSVGElement>((props, ref) => <ViewColumn {...props} ref={ref} />),
  ListAdd: forwardRef<SVGSVGElement>((props, ref) => <PlaylistAddIcon {...props} ref={ref} />),
  Star: forwardRef<SVGSVGElement>((props, ref) => <StarBorder {...props} ref={ref} />),
  Up: forwardRef<SVGSVGElement>((props, ref) => <ArrowUpwardIcon  {...props} ref={ref} />),
  Down: forwardRef<SVGSVGElement>((props, ref) => <ArrowDownwardIcon {...props} ref={ref} />)
};

export const JsampleTheme = responsiveFontSizes(createTheme({
  palette: {
    primary: {
      light: "#fff",
      main: "rgb(23, 105, 170)",
      dark: "#000"
    },
    secondary: {
      main: "#f44336"
    }
  },
  breakpoints: {
    values: {
      xs: 200,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920
    }
  },
}));

JsampleTheme.typography.body2 = {
  fontSize: 16,
};

export const jstyles = (theme) => ({
	"field1": { width: 80 },
	"field2": { width: 120 }
});
