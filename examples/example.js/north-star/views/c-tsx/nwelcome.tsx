import React from "react";
import { AnContext, AnContextType, ClassNames, CrudCompW, invalidStyles, SysComp } from "@anclient/anreact";
import { Semantier, Tierec } from "@anclient/semantier-st";
import { Card, Grid, Link, Paper, SvgIcon, Theme, Typography, withStyles, withWidth } from "@material-ui/core";
import { WelcomeProp } from "../../common/north";

class WelcomeComp extends CrudCompW<WelcomeProp> {
    uri = '/n/home';

    context: typeof AnContext;
    tier: WelcomeTier;
    sys: typeof SysComp;


    constructor(props: WelcomeProp) {
        super(props);

        this.sys = props.sys;

        this.getCards = this.getCards.bind(this);
        this.getCard = this.getCard.bind(this);

        this.tier = new WelcomeTier(this);
    }

    componentDidMount() {
        this.tier.setContext(this.context as unknown as AnContextType);
    }

    getCards(classes: WelcomeClasses) {
      return (
        <Grid container >{this.tier.rows.map( (r, rx: number) =>
            this.getCard(classes, r, rx)
        )}</Grid>);
    }

    getCard(classes: WelcomeClasses, r: any, rx: number) {
        return (
          <Grid item {...r.grid} key={rx}>
          <Card key={rx} className={classes.card}>
            <Typography className={classes.cardTitle} >{r.title}</Typography>
            {cardLink(classes, r.msg, r.link)}
            <Typography className={classes.pusherText} >{avatar(r.pusher, r.css, {})}{r.pusher}</Typography>
          </Card>
          </Grid>);

        function cardText(classes: WelcomeClasses, msg: string) {
            return msg?.split('\n').map( (ln, lx) => {
                return <Typography key={lx} className={classes.cardText}>{ln}</Typography>
            });
        }

        function cardLink(classes: WelcomeClasses, msg : string, href?: string) {
            if (href)
                return (<Link href={href} className={classes.cardText}>{msg}</Link>);
            else return cardText(classes, msg);
        }
    }

    render() {
        const { classes } = this.props;
        const c = this.getCards(classes as WelcomeClasses);
        return <Paper className={classes.board}>{c}</Paper>;
    }
}
WelcomeComp.contextType = AnContext;

interface WelcomeClasses extends ClassNames {
    board: string;
    card: string;
    cardTitle: string;
    cardText: string;
    pusherText: string;
}

interface CardCss {
    icon: string;
}
/**
 *
 * @param theme
 * @returns
 */
const styles = (theme: Theme) => (Object.assign(
	invalidStyles,
    { board: {
		backgroundColor: '#f7f9f1',
        padding: theme.spacing(1),
        marginTop: 40,
        margin: "auto",
        maxWidth: "76vw",
        minWidth: 200,
      },
	  card: {
        minHeight: 100,
        maxHeight: "24vh",
        minWidth: "99%",
        margin: theme.spacing(1),
		backgroundColor: '#f1fffe',
	  },
      cardTitle: {
        // textAlign: 'center',
        fontSize: '1.2em',
        margin: theme.spacing(1),
        borderBottom: '2px solid lightgrey'
      },
	  cardText: {
		padding: theme.spacing(1),
		borderLeft: '1px solid #bcd',
	  },
	  pusherText: {
		paddingLeft: theme.spacing(1),
		paddingRight: theme.spacing(1),
        display: 'flex',
        lineHeight: 2,
        alignItmes: "center",
		borderLeft: '1px solid #bcd' }
	}
) );

const WelcomePage = withWidth()(withStyles(styles)(WelcomeComp));
export { WelcomePage , WelcomeComp }

interface GridItem {xs?: number; md?: number; sm?: number; lg?: number; xl?: number};

interface NoteRec extends Tierec {
    pusher: string;
    title: string;
    msg?: string;
    link?: string;
    date?: string | Date;
    css?: object;
    grid?: GridItem;
}

class WelcomeTier extends Semantier {
    constructor(comp: React.Component) {
        super(comp);
    }

    rows: NoteRec[] = [
        { title: 'Notification 1', msg: 'Anprism.ts is on the road ...', date: new Date(), pusher: 'Robot',
          grid: {md: 6, sm: 12} },
        { title: 'Coding cat is retired!', msg: `Never mind.
          Here comes the footing dog.`, date: 'Yesterday', pusher: 'Ody',
          grid: {md: 12, sm: 12} },
        { title: 'VS Code!', date: 'Last Year', msg: 'Credits: Icons8 Flat Color Icons',
          link: 'https://github.com/icons8/flat-color-icons',
          pusher: 'Bill', css: {icon: 'Send'},
          grid: {md: 6, sm: 12} },
        { title: 'Big Names!', date: '--', pusher: 'Trump', css: {icon: 'Add'},
          grid: {md: 6, sm: 12} },
    ];
}

export function welcome(sysComp: typeof SysComp, props: WelcomeProp) {
    return <WelcomePage sys={sysComp} classes={props.classes} {...props} />
}

/**
 * Create an svg avatar.
 * @param pusher
 * @param css
 * @param props how about fill attributes?
 * @returns
 */
function avatar(pusher: string, css: CardCss, props: object): JSX.Element | void {
    if (css?.icon === 'Send')
      return (
        <SvgIcon fontSize="inherit" style={{ width: 28, height: 28 }} viewBox="0 0 48 48" {...props}>
            <path d="M11.5 24 h1 v-11.5 h11.5 v-1 h-11.5 v-11.5 h-1z" />
            <rect x="5" y="19" fill="#CFD8DC" width="38" height="19"/>
            <rect x="5" y="38" fill="#B0BEC5" width="38" height="4"/>
            <rect x="27" y="24" fill="#455A64" width="12" height="18"/>
            <rect x="9" y="24" fill="#E3F2FD" width="14" height="11"/>
            <rect x="10" y="25" fill="#1E88E5" width="12" height="9"/>
            <path fill="#90A4AE" d="M36.5,33.5c-0.3,0-0.5,0.2-0.5,0.5v2c0,0.3,0.2,0.5,0.5,0.5S37,36.3,37,36v-2C37,33.7,36.8,33.5,36.5,33.5z"/>
            <g fill="#558B2F">
                <circle cx="24" cy="19" r="3"/>
                <circle cx="36" cy="19" r="3"/>
                <circle cx="12" cy="19" r="3"/>
            </g>
            <path fill="#7CB342" d="M40,6H8C6.9,6,6,6.9,6,8v3h36V8C42,6.9,41.1,6,40,6z"/>
            <rect x="21" y="11" fill="#7CB342" width="6" height="8"/>
            <polygon fill="#7CB342" points="37,11 32,11 33,19 39,19"/>
            <polygon fill="#7CB342" points="11,11 16,11 15,19 9,19"/>
            <g fill="#FFA000">
                <circle cx="30" cy="19" r="3"/>
                <path d="M45,19c0,1.7-1.3,3-3,3s-3-1.3-3-3s1.3-3,3-3L45,19z"/>
                <circle cx="18" cy="19" r="3"/>
                <path d="M3,19c0,1.7,1.3,3,3,3s3-1.3,3-3s-1.3-3-3-3L3,19z"/>
            </g>
            <g fill="#FFC107">
                <polygon points="32,11 27,11 27,19 33,19"/>
                <polygon points="42,11 37,11 39,19 45,19"/>
                <polygon points="16,11 21,11 21,19 15,19"/>
                <polygon points="6,11 11,11 9,19 3,19"/>
            </g>
        </SvgIcon>);
    else if (css?.icon === 'Add')
      return (
        <SvgIcon fontSize="inherit" style={{ width: 28, height: 28 }} viewBox="0 0 48 48" {...props}>
            <path fill="#9CCC65" d="M32,15V7H16v8L6.2,40c-0.6,1.5,0.5,3,2.1,3h31.5c1.6,0,2.6-1.6,2.1-3L32,15z"/>
            <path fill="#8BC34A" d="M32,9H16c-1.1,0-2-0.9-2-2v0c0-1.1,0.9-2,2-2h16c1.1,0,2,0.9,2,2v0C34,8.1,33.1,9,32,9z"/>
            <path fill="#2E7D32" d="M28,30c0,4.4-4,8-4,8s-4-3.6-4-8s4-8,4-8S28,25.6,28,30z"/>
            <path fill="#388E3C" d="M31.1,32.6c-2,4-7.1,5.4-7.1,5.4s-2-5,0-8.9s7.1-5.4,7.1-5.4S33.1,28.6,31.1,32.6z"/>
            <path fill="#43A047" d="M16.9,32.6c2,4,7.1,5.4,7.1,5.4s2-5,0-8.9s-7.1-5.4-7.1-5.4S14.9,28.6,16.9,32.6z"/>
        </SvgIcon>);
    else if (pusher === 'Robot')
      return (
        <SvgIcon fontSize="inherit" style={{ width: 28, height: 28 }} viewBox="0 0 48 48" {...props}>
            <path fill="#FFCDD2" d="M5,38V14h38v24c0,2.2-1.8,4-4,4H9C6.8,42,5,40.2,5,38z"/>
            <path fill="#F44336" d="M43,10v6H5v-6c0-2.2,1.8-4,4-4h30C41.2,6,43,7.8,43,10z"/>
            <g fill="#B71C1C">
                <circle cx="33" cy="10" r="3"/>
                <circle cx="15" cy="10" r="3"/>
            </g>
            <g fill="#BDBDBD">
                <path d="M33,3c-1.1,0-2,0.9-2,2v5c0,1.1,0.9,2,2,2s2-0.9,2-2V5C35,3.9,34.1,3,33,3z"/>
                <path d="M15,3c-1.1,0-2,0.9-2,2v5c0,1.1,0.9,2,2,2s2-0.9,2-2V5C17,3.9,16.1,3,15,3z"/>
            </g>
            <path fill="#F44336" d="M22.2,35.3c0-0.2,0-0.5,0.1-0.7c0.1-0.2,0.2-0.4,0.4-0.5s0.3-0.3,0.5-0.3c0.2-0.1,0.5-0.1,0.7-0.1 s0.5,0,0.7,0.1c0.2,0.1,0.4,0.2,0.6,0.3s0.3,0.3,0.4,0.5c0.1,0.2,0.1,0.4,0.1,0.7c0,0.2,0,0.5-0.1,0.7c-0.1,0.2-0.2,0.4-0.4,0.5 c-0.2,0.1-0.3,0.3-0.6,0.3S24.3,37,24,37s-0.5,0-0.7-0.1c-0.2-0.1-0.4-0.2-0.5-0.3c-0.2-0.1-0.3-0.3-0.4-0.5 C22.3,35.8,22.2,35.6,22.2,35.3z M25.3,31h-2.6l-0.4-11h3.3L25.3,31z"/>
        </SvgIcon>);
}
