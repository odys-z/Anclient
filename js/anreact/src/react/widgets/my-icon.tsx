import React, { Ref } from 'react';
import { withStyles } from "@material-ui/core/styles";
import Button from '@material-ui/core/Button';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import SvgIcon from "@material-ui/core/SvgIcon";

import { AnContext, AnContextType } from '../reactext';
import { Comprops } from '../crud';
import { SessionClient } from '@anclient/semantier-st/anclient';

const styles = theme => ({
  root: {
	color: "wheat",
	// backgroundColor: "primary",
	// textAlign: "center",
	"&: hover": {
		color: "linen"
	}
  },
});

export const gCameraViewBox = "0 0 512 512";

export interface AvatarIconProps extends Comprops {
	viewBox?: any;
    onClick: (e?: React.MouseEvent<SVGSVGElement>) => void;
    textInfo: (ssInf: SessionClient | undefined) => string;
	ref?: Ref<SVGSVGElement>;
}

export const AvatarIcon = function (props: AvatarIconProps) {
  if (!props.viewBox)
		props.viewBox = gCameraViewBox;

  let { width, height, left, top, position } = props;
  let style = Object.assign ({ width: 64, height: 64,
	 				  position: 'inherit', left: 0, top: 32},
					{ width, height, top, left, position});
  return (
	<SvgIcon style={style} fontSize="inherit" {...props} >
		<g> <path d="M76.8,121.6C34.385,121.6,0,155.985,0,198.4V480h89.6V121.6H76.8z"/>
			<path d="M435.2,121.6H128V480h384V198.4C512,155.985,477.615,121.6,435.2,121.6z M288,422.4c-67.05,0-121.6-54.55-121.6-121.6
					S220.95,179.2,288,179.2s121.6,54.55,121.6,121.6S355.05,422.4,288,422.4z M435.2,224c-14.139,0-25.6-11.461-25.6-25.6
					c0-14.139,11.461-25.6,25.6-25.6c14.139,0,25.6,11.461,25.6,25.6C460.8,212.539,449.339,224,435.2,224z"/>
			<path d="M288,217.6c-45.876,0-83.2,37.324-83.2,83.2S242.124,384,288,384s83.2-37.324,83.2-83.2S333.876,217.6,288,217.6z"/>
			<polygon points="320,32 192,32 166.4,83.2 345.6,83.2 "/>
		</g>
	</SvgIcon>
  );
}

export const gCamera = (`<g>
	<path d="M76.8,121.6C34.385,121.6,0,155.985,0,198.4V480h89.6V121.6H76.8z"/>
		<path d="M435.2,121.6H128V480h384V198.4C512,155.985,477.615,121.6,435.2,121.6z M288,422.4c-67.05,0-121.6-54.55-121.6-121.6
				S220.95,179.2,288,179.2s121.6,54.55,121.6,121.6S355.05,422.4,288,422.4z M435.2,224c-14.139,0-25.6-11.461-25.6-25.6
				c0-14.139,11.461-25.6,25.6-25.6c14.139,0,25.6,11.461,25.6,25.6C460.8,212.539,449.339,224,435.2,224z"/>
		<path d="M288,217.6c-45.876,0-83.2,37.324-83.2,83.2S242.124,384,288,384s83.2-37.324,83.2-83.2S333.876,217.6,288,217.6z"/>
		<polygon points="320,32 192,32 166.4,83.2 345.6,83.2 "/>
	</g>`);

class MyIconComp extends React.Component<AvatarIconProps> {
	state = {
		title: "Personal Settings",
	};

	constructor (props: AvatarIconProps) {
		super(props);
		this.onClick = this.onClick.bind(this);
		this.textInfo = this.textInfo.bind(this);
	}

	onClick(e) {
		e.stopPropagation();
		if (typeof this.props.onClick === 'function')
			this.props.onClick();
	}

	textInfo(ssInf) {
		return ssInf ? `${ssInf.uid}` : '...';
	}

	render () {
		const ctx = this.context as unknown as AnContextType;
		let txtInfo = this.textInfo(ctx.anClient.ssInf);

		const { classes } = this.props;

		return (<>
		<Button
			variant="contained"
			className={classes.root}
			color="primary"
			onClick={this.onClick}
			startIcon={<AccountCircleIcon />} >
				{txtInfo}
			</Button>
		</>);
	}
}
MyIconComp.contextType = AnContext;

const MyIcon = withStyles(styles)(MyIconComp);
export {MyIcon, MyIconComp};
