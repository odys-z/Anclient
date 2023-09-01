import React, { ReactNode } from 'react';
import withStyles from "@material-ui/core/styles/withStyles";
import { Theme } from '@material-ui/core/styles';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination, { LabelDisplayedRowsArgs } from '@material-ui/core/TablePagination';
import Checkbox from '@material-ui/core/Checkbox';

import { AnlistColAttrs, Tierec, isEmpty, PageInf, toBool, len, DbCol } from '@anclient/semantier';
import { DetailFormW } from '../crud';
import { CompOpts } from '../anreact';
import { AnTablistProps } from './table-list';
import { L } from '../../utils/langstr';

const styles = (theme: Theme) => ( {
	root: {
		margin: theme.spacing(1),
	}
} );

/**
 * Table / list with pager. (Experimental)
 */
class AnTablPagerComp extends DetailFormW<AnTablistProps> {

	sizeOptions = [10, 25, 50];

	state = {
		selected: undefined as Map<string, Tierec>
	};

    page: PageInf;

	checkAllBox: HTMLButtonElement | null;

	constructor(props: AnTablistProps) {
		super(props)

		let {selected} = props;
		if (!selected || !selected.ids)
			throw Error('Type safe checking: @anclient/react now using ref ids: Set<string> to save selected row ids. (props selectedIds renamed as selected)')

		this.state.selected = selected.ids;
		// if (!this.state.selected || this.state.selected.constructor.name !== 'Set')
		// 	throw Error("selected.ids must be a set");
		if (!this.state.selected || this.state.selected.constructor.name !== 'Map')
			throw Error("Since @anclient/anreact 0.4.48, selected.ids must be a Map<stirng, Tierec>.");

        this.sizeOptions = props.sizeOptions || [10, 25, 50];

		this.page = props.pageInf;

		this.isSelected = this.isSelected.bind(this);
		this.toSelectAll = this.toSelectAll.bind(this);

		this.rowPageLabel = this.rowPageLabel.bind(this);
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

	rowPageLabel (_paginationInfo: LabelDisplayedRowsArgs) : ReactNode {
		let {count, from, to, page} = _paginationInfo;
		let sz = _paginationInfo.from - _paginationInfo.to + 1;
		let pages = count > 0
			? Math.floor((count + sz - 1) / sz)
			: 0;

		return L('{from} - {to}, page {page} / {pages}', {from, to, page, pages});
	}

	handleClick(e: React.MouseEvent<HTMLElement>, newSelct: string, node: Tierec) {
		let selected = this.state.selected;
		if (this.props.singleCheck) {
			selected.clear();
			selected.set(newSelct, node);
		}
		else {
			if (selected.has(newSelct)) {
				selected.delete(newSelct);
			}
			else selected.set(newSelct, node);
		}

		this.setState({});
		this.updateSelectd(selected);
	};

	toSelectAll (e: React.ChangeEvent<HTMLInputElement>, checked: boolean) : void {
		let ids = this.props.selected?.ids || new Map<string, Tierec>();
		if (e.target.checked) {
			this.props.rows?.forEach((r) => ids.set(r[this.props.pk] as string, r));
			this.updateSelectd(ids);
		}
		else {
			ids.clear();
			this.updateSelectd(ids);
		}
		this.setState({});
	};

	updateSelectd (set: Map<string, Tierec>) {
		if (typeof this.props.onSelectChange === 'function')
			this.props.onSelectChange(set);
	}

	changePage(_event: React.MouseEvent<HTMLElement> | null, page: number) {
		this.setState({page});
		if (typeof this.props.onPageChange === 'function')
			this.props.onPageChange (page, this.page.size);
	}

	changeSize (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
		let size = parseInt(event.target.value, 10);
		this.setState({size});
		this.page.size = size;
		if (typeof this.props.onPageChange  === 'function')
			this.props.onPageChange (this.page.page, this.page.size);
	}

	/**
	 * Render table head.
	 * @param {array} [columns] table columns
	 * @returns [<TableCell>,...]
	 */
	th(columns: Array<AnlistColAttrs<JSX.Element, CompOpts>> = []) {
		return columns
			.filter( (v, x) =>
						toBool(v.hide) || !toBool(v.visible, true) ?
						false : !(this.props.checkbox && x === 0) ) // first columen as checkbox
			.map( (colObj, index) =>
				<TableCell key={index}>
					{colObj.label || colObj.field}
				</TableCell>);
	}

	tr(rows = [] as Tierec[], columns = [] as AnlistColAttrs<any, any>[]) {
		return rows.map(row => {
			let pkv = row[this.props.pk] as string;

			if (this.props.checkbox && toBool(row.checked)) {
				this.state.selected.set(pkv, row)
				row.checked = 0; // later events don't need ths
			}
			let isItemSelected = this.isSelected(pkv);

			return (
				<TableRow key= {row[this.props.pk] as string} hover
					selected={isItemSelected}
					onClick= { (event) => {
						this.handleClick(event, pkv, row);
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
					{columns
						// first column as checkbox
						.filter( (v, x) => 
								!toBool(v.hide) && toBool(v.visible, true)
								&& (!this.props.checkbox || x !== 0))
						.map( (colObj, x) => {
							if (colObj.field === undefined)
								throw Error("Column field is required: " + JSON.stringify(colObj));
							let v = row[colObj.field];
							let cell = colObj.formatter && colObj.formatter(v as DbCol, x, row); // bug?
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
				  ( <TableCell padding="checkbox" >
					<Checkbox ref={ref => (this.checkAllBox = ref)}
						indeterminate={this.state.selected.size > 0 && this.state.selected.size < len(this.props.rows)}
						checked={this.state.selected.size > 0 && this.state.selected.size === len(this.props.rows)}
						color="primary"
						inputProps={{ 'aria-label': 'checkAll' }}
						onChange={this.toSelectAll}/>
				  </TableCell> )
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
			rowsPerPage={this.page.size || -1}
			onPageChange={this.changePage}
			onRowsPerPageChange={this.changeSize}
			page={this.page.page}
			component="div"
			rowsPerPageOptions={this.sizeOptions}
			labelDisplayedRows={this.rowPageLabel}
		/>}
	  </>);
	}
}

const AnTablPager = withStyles<any, any, AnTablistProps>(styles)(AnTablPagerComp);
export { AnTablPager, AnTablPagerComp }
