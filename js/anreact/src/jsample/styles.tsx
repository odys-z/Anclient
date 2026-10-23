import React from "react";
import { forwardRef } from 'react';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

import AddBox from '@mui/icons-material/AddBox';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import Check from '@mui/icons-material/Check';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Clear from '@mui/icons-material/Clear';
import Close from '@mui/icons-material/Close';
import DeleteOutline from '@mui/icons-material/DeleteOutlineOutlined';
import Edit from '@mui/icons-material/Edit';
import FilterList from '@mui/icons-material/FilterList';
import FirstPage from '@mui/icons-material/FirstPage';
import LastPage from '@mui/icons-material/LastPage';
import Remove from '@mui/icons-material/Remove';
import SaveAlt from '@mui/icons-material/SaveAlt';
import Search from '@mui/icons-material/Search';
import ViewColumn from '@mui/icons-material/ViewColumn';
import StarBorder from '@mui/icons-material/StarBorder';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';

import FormatLineSpacingIcon from '@mui/icons-material/FormatLineSpacing';
import GridOnIcon from '@mui/icons-material/GridOn';
import { DefaultComponentProps } from '@mui/material/OverridableComponent';

export const JsampleIcons = {
  Add   : forwardRef<SVGSVGElement, {onClick?: any} & DefaultComponentProps<any>>((props, ref) => <AddBox {...props} ref={ref} />),
  Check : forwardRef<SVGSVGElement, {onClick?: any} & DefaultComponentProps<any>>((props, ref) => <Check {...props} ref={ref} />),
  Clear : forwardRef<SVGSVGElement, {onClick?: any} & DefaultComponentProps<any>>((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef<SVGSVGElement, {onClick?: any} & DefaultComponentProps<any>>((props, ref) => <DeleteOutline {...props} ref={ref} />),
  Close : forwardRef<SVGSVGElement, {onClick?: any} & DefaultComponentProps<any>>((props, ref) => <Close {...props} ref={ref} />),
  Edit  : forwardRef<SVGSVGElement, {onClick?: any} & DefaultComponentProps<any>>((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef<SVGSVGElement, {onClick?: any} & DefaultComponentProps<any>>((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef<SVGSVGElement, {onClick?: any} & DefaultComponentProps<any>>((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef<SVGSVGElement, {onClick?: any} & DefaultComponentProps<any>>((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage : forwardRef<SVGSVGElement, {onClick?: any} & DefaultComponentProps<any>>((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage : forwardRef<SVGSVGElement, {onClick?: any} & DefaultComponentProps<any>>((props, ref) => <ChevronRight {...props} ref={ref} />),
  DetailPanel : forwardRef<SVGSVGElement, {onClick?: any} & DefaultComponentProps<any>>((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef<SVGSVGElement>((props, ref) => <ChevronLeft {...props} ref={ref} />),
  ResetSearch : forwardRef<SVGSVGElement>((props, ref) => <Clear {...props} ref={ref} />),
  ViewColumn  : forwardRef<SVGSVGElement, {onClick?: any} & DefaultComponentProps<any>>((props, ref) => <ViewColumn {...props} ref={ref} />),
  ItemCollapse: forwardRef<SVGSVGElement, {onClick?: any} & DefaultComponentProps<any>>((props, ref) => <FormatLineSpacingIcon {...props} ref={ref} />),
  Search      : forwardRef<SVGSVGElement, {onClick?: any} & DefaultComponentProps<any>>((props, ref) => <Search {...props} ref={ref} />),
  SortArrow   : forwardRef<SVGSVGElement, {onClick?: any} & DefaultComponentProps<any>>((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef<SVGSVGElement, {onClick?: any} & DefaultComponentProps<any>>((props, ref) => <Remove {...props} ref={ref} />),
  Worksheet   : forwardRef<SVGSVGElement, {onClick?: any} & DefaultComponentProps<any>>((props, ref) => <GridOnIcon {...props} ref={ref} />),
  ListAdd : forwardRef<SVGSVGElement, {onClick?: any} & DefaultComponentProps<any>>((props, ref) => <PlaylistAddIcon {...props} ref={ref} />),
  Star    : forwardRef<SVGSVGElement, {onClick?: any} & DefaultComponentProps<any>>((props, ref) => <StarBorder {...props} ref={ref} />),
  Up      : forwardRef<SVGSVGElement, {onClick?: any} & DefaultComponentProps<any>>((props, ref) => <ArrowUpwardIcon  {...props} ref={ref} />),
  Down    : forwardRef<SVGSVGElement, {onClick?: any} & DefaultComponentProps<any>>((props, ref) => <ArrowDownwardIcon {...props} ref={ref} />)
};

export const JsampleTheme = responsiveFontSizes(createTheme({
  palette: {
    primary: {
      light: "rgb(84 174 186)",
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

export const jstyles = (_theme) => ({
	"field1": { width: 80 },
	"field2": { width: 120 }
});
