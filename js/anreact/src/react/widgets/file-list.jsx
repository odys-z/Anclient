import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";


const styles = (theme) => ( {
	root: {
	}
} );

/**
 * Should a TableList with FileUploads is enough?
 */
class FileListComp extends React.Component {

	state = {
		sizeOptions:[10, 25, 50],
		total: 0,
		page: 0,
		size: 10,
	}

	selected = undefined; // props.selected.Ids, the set

	constructor(props){
		super(props)

	}

	componentDidMount() {
	}

	isSelected(k) {
		return this.selected.has(k);
	}

	handleClick(event, newSelct) {
		let selected = this.selected;
		if (this.props.singleCheck) {
			if (selected.has(newSelct))
				selected.clear();
			else {
				selected.clear();
				selected.add(newSelct);
			}
		}
		else {
			if (selected.has(newSelct)) {
				selected.delete(newSelct);
			}
			else selected.add(newSelct);
		}

		if (this.props.onSelectChange)
			this.props.onSelectChange(selected, newSelct);
	};

	toSelectAll (event) {
		if (event.target.checked) {
			let key = this.props.pk;
			this.props.rows.forEach((n) => this.selected.add(n[key]));

			if (this.props.onSelectChange)
				this.props.onSelectChange(this.selected, this.selected);
		}
		else {
			this.selected.clear();

			if (this.props.onSelectChange)
				this.props.onSelectChange(this.selected, []);
		}
	};

	changePage(event, page) {
		this.setState({page});
		if (typeof this.props.onPageInf === 'function')
			this.props.onPageInf (this.state.page, this.state.size);
	}

	changeSize (event, s) {
		let size = parseInt(event.target.value, 10);
		this.setState({size});
		if (typeof this.props.onPageInf  === 'function')
			this.props.onPageInf (this.state.page, this.state.size);
	}

	/**
	 * Render table head.
	 * @param {array} [columns] table columns
	 * @returns [<TableCell>,...]
	 */
	th(columns = []) {
		return columns.filter( (v, x) => toBool(v.hide) ? false
							: !(this.props.checkbox && x === 0)) // first columen as checkbox
			.map( (colObj, index) =>
				<TableCell key={index}>
					{colObj.text || colObj.field}
				</TableCell>);
	}

	tr(rows = [], columns = []) {
		return rows.map(row => {
			let pkv = typeof this.props.pk === 'string' ? row[this.props.pk]
					: row[this.props.pk.field];

			if (this.props.checkbox && toBool(row.checked)) {
				this.selected.add(pkv)
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
					{columns.filter( (v, x) => toBool(v.hide) ? false
									: !(this.props.checkbox && x === 0)) // first columen as checkbox
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
		return (<>TODO: File List</>);
	}
}
FileListComp.propTypes = {
};

const FileList = withStyles(styles)(FileListComp);
export { FileList, FileListComp }
