import React from "react";
import { AnContext, SysComp } from "@anclient/anreact";
import { Semantier } from "@anclient/semantier-st";
import { Card, Paper, Typography, withStyles, withWidth } from "@material-ui/core";

type Prop = Readonly<{ classes: typeof styles; sys: typeof SysComp }>;

class WelcomeComp extends React.Component<Prop, any, any> {
    uri = '/n/home';

    context: typeof AnContext;
    tier: WelcomeTier;
    sys: typeof SysComp;


    constructor(props: Prop) {
        super(props);

        this.sys = props.sys;

        this.getCards = this.getCards.bind(this);
        this.getCard = this.getCard.bind(this);

        this.tier = new WelcomeTier(this);
    }

    componentDidMount() {
        this.tier.setContext(this.context);
    }

    getCards(classes) {
        return this.tier.rows.map( (r, rx: number) => 
            this.getCard(classes, r, rx)
        )
    }

    getCard(classes, r: any, rx: number) {
        return <Card key={rx} className={classes.Card}>
            <Typography className={classes.CardTitle}>{r.title}</Typography>
            </Card>;
    }

    render() {
        const { classes } = this.props;
        const c = this.getCards(classes);
        return <Paper className={classes.Board}>{c}</Paper>; 
    }
}
WelcomeComp.contextType = AnContext;

/**
 * @param theme 
 * @returns 
 */
const styles = (theme) => (Object.assign(
	Semantier.invalidStyles,
	{ Card: {
        minHeight: "12vh",
        maxHeight: "24vh",
        margin: theme.spacing(1),
		backgroundColor: '#f1fffe',
	  },
      Board: {
		backgroundColor: '#f7f9f1',
        padding: theme.spacing(1),
        marginTop: 40,
        maxWidth: 600,
        minWidth: 200,
      },
      CardTitle: {
        textAlign: 'center',
        fontSize: '1.2em',
        margin: theme.spacing(1),
        borderBottom: '1px solid silver'
      },
	  CardText: {
		padding: theme.spacing(1),
		borderLeft: '1px solid #bcd',
	  },
	  PusherText: {
		paddingLeft: theme.spacing(1),
		paddingRight: theme.spacing(1),
		borderLeft: '1px solid #bcd' }
	}
) );

const WelcomePage = withWidth()(withStyles(styles)(WelcomeComp));
export { WelcomePage , WelcomeComp }

class WelcomeTier extends Semantier {
    constructor(comp: React.Component) {
        super(comp);
    }

    rows = [
        {title: 'Notification 1', date: new Date(), pusher: 'Robot'},
        {title: 'Coding cat is retired!', date: 'Yesterday', pusher: 'Ody'},
        {title: 'VS Code!', date: 'Last Year', pusher: 'Bill'},
        {title: 'Big Names!', date: '--', pusher: 'Trump', css: {icon: 'Add'} }
    ];
}

export function welcome(sysComp: typeof SysComp, props: Prop) {
    return <WelcomePage sys={sysComp} classes={props.classes} {...props} />
}