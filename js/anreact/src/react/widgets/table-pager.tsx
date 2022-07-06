import React from 'react';
import withStyles from "@material-ui/core/styles/withStyles";
import { Theme } from '@material-ui/core/styles';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import Checkbox from '@material-ui/core/Checkbox';

import { AnlistColAttrs, isEmpty, PageInf, toBool } from '@anclient/semantier';
import { DetailFormW } from '../crud';
import { CompOpts } from '../anreact';
import { AnTablistProps } from './table-list';

const styles = (theme: Theme) => ( {
	root: {
	}
} );

/**
 * Table / list with pager. (Experimental)
 */
class AnTablPagerComp extends DetailFormW<AnTablistProps> {

	sizeOptions = [10, 25, 50];

	state = {
		// total: 0,
		// page: 0,
		// size: 10,

		selected: undefined
	}

    page: PageInf;

	checkAllBox: HTMLButtonElement;

	constructor(props: AnTablistProps) {
		super(props)

		let {selected} = props;
		if (!selected || !selected.ids)
			throw Error('Type safe checking: @anclient/react now using ref ids: Set<string> to save selected row ids. (props selectedIds renamed as selected)')
		this.state.selected = selected.ids;
		if (!this.state.selected || this.state.selected.constructor.name !== 'Set')
			throw Error("selected.ids must be a set");

		// if (sizeOptions)
		// 	this.state.sizeOptions = sizeOptions;
        this.sizeOptions = props.sizeOptions || [10, 25, 50];

		let {total, page, size} = props.pageInf || {};
		this.page = new PageInf(page || 0, size || 25, total || 0);

		this.isSelected = this.isSelected.bind(this);
		this.toSelectAll = this.toSelectAll.bind(this);

		this.changePage = this.changePage.bind(this);
		this.changeSize = this.changeSize.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.updateSelectd = this.updateSelectd.bind(this);

		this.th = this.th.bind(this);
		this.tr = this.tr.bind(this);
		if (isEmpty(props.pk)) // for jsx checking
			console.error("WARN: AnTablist uses rows[props.pk] for React.js children keys. Null pk will report error.");
	}

	componentDidMount() {
	}

	isSelected(k: string) {
		return this.state.selected.has(k);
	}

	handleClick(e: React.MouseEvent<HTMLElement>, newSelct: string) {
		let selected = this.state.selected;
		if (this.props.singleCheck) {
			selected.clear();
			selected.add(newSelct);
		}
		else {
			if (selected.has(newSelct)) {
				selected.delete(newSelct);
			}
			else selected.add(newSelct);
		}

		this.setState({});
		this.updateSelectd(selected);
	};

	toSelectAll (e: React.ChangeEvent<HTMLInputElement>, checked: boolean) : void {
		let ids = this.props.selected.ids; // || this.props.selectedIds.ids;
		if (e.target.checked) {
			this.props.rows.forEach((r) => ids.add(r[this.props.pk] as string));
			this.updateSelectd(ids);
		}
		else {
			ids.clear();
			this.updateSelectd(ids);
		}
		this.setState({});
	};

	updateSelectd (set: Set<string>) {
		if (typeof this.props.onSelectChange === 'function')
			this.props.onSelectChange(Array.from(set));
	}

	changePage(_event: React.UIEvent, page: number) {
		this.setState({page});
		if (typeof this.props.onPageChange === 'function')
			this.props.onPageChange (page);
	}

	changeSize (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
		let size = parseInt(event.target.value, 10);
		this.setState({size});
		if (typeof this.props.onPageInf  === 'function')
			this.props.onPageInf (this.page.page, this.page.size);
	}

	/**
	 * Render table head.
	 * @param {array} [columns] table columns
	 * @returns [<TableCell>,...]
	 */
	th(columns: Array<AnlistColAttrs<JSX.Element, CompOpts>> = []) {
		return columns
			.filter( (v, x) => // !toBool(v.visible, true) ? 
							toBool(v.hide) || !toBool(v.visible, true) ?
							false : !(this.props.checkbox && x === 0)) // first columen as checkbox
			.map( (colObj, index) =>
				<TableCell key={index}>
					{colObj.label || colObj.field}
				</TableCell>);
	}

	tr(rows = [], columns = []) {
		return rows.map(row => {
			let pkv = row[this.props.pk];

			if (this.props.checkbox && toBool(row.checked)) {
				this.state.selected.add(pkv)
				row.checked = 0; // later events don't need ths
			}
			let isItemSelected = this.isSelected(pkv);

			return (
				<TableRow key= {row[this.props.pk]} hover
					selected={isItemSelected}
					onClick= { (event) => {
						this.handleClick(event, pkv);
					} }
					role="checkbox" aria-checked={isItemSelected}
				>
					{this.props.checkbox && (
						<TableCell component="th" scope="row" padding="checkbox">
							<Checkbox
								color="primary"
								checked ={isItemSelected}
							/>
						</TableCell>)
					}
					{columns.filter( (v, x) => //!toBool(v.hide)
									!toBool(v.hide) && toBool(v.visible, true)
									&& (!this.props.checkbox || x !== 0)) // first columen as checkbox
							.map( (colObj, x) => {
								if (colObj.field === undefined)
									throw Error("Column field is required: " + JSON.stringify(colObj));
								let v = row[colObj.field];
								let cell = colObj.formatter && colObj.formatter(v, x, row);
								if (cell)
									cell = <TableCell key={colObj.field + x}>{cell}</TableCell>;
								return cell || <TableCell key={colObj.field + x}>{v}</TableCell>;
							} )}
				</TableRow>)
		});
	}

	render() {
		return (<>
		<TableContainer>
		  <Table style={{width:"100%"}} aria-label="simple table">
			<TableHead>
				<TableRow>
					{ this.props.checkbox &&
						(<TableCell padding="checkbox" >
						  <Checkbox ref={ref => (this.checkAllBox = ref)}
							indeterminate={this.state.selected.size > 0 && this.state.selected.size < this.props.rows.length}
							checked={this.state.selected.size > 0 && this.state.selected.size === this.props.rows.length}
							color="primary"
							inputProps={{ 'aria-label': 'checkAll' }}
							onChange={this.toSelectAll}/>
						</TableCell>)
					}
					{this.th(this.props.columns)}
				</TableRow>
			</TableHead>
			<TableBody>
				{this.tr(this.props.rows, this.props.columns)}
			</TableBody>
		  </Table>
		</TableContainer>
		{toBool(this.props.paging, true) && <TablePagination
			count = {this.props.pageInf ? this.props.pageInf.total || 0 : 0}
			rowsPerPage={this.page.size}
			onPageChange={this.changePage}
			onRowsPerPageChange={this.changeSize}
			page={this.page.page}
			component="div"
			rowsPerPageOptions={this.sizeOptions}
		/>}
		</>);
	}
}

const AnTablPager = withStyles<any, any, AnTablistProps>(styles)(AnTablPagerComp);
export { AnTablPager, AnTablPagerComp }
