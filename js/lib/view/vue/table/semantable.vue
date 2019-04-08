<template >
	<!--
  <div class="col-md-12" ref='semantbl'>
	-->
  <div ref='semantbl'>
	  <!--
    <div class="table-responsive" :style="{height: jstyle.jh}" >
		-->
    <div >
      <table class="table table-striped table-bordered" style="width:100%">
          <thead width="100%">
              <tr>
                <th v-for="key in columns" :key="key" v-if="isVisible(key)" >
					<i class="fas float-right">{{head(key)}}</i>
				</th>
              </tr>
          </thead>
		  <div style="overflow:auto; display:block" :style="{height: jstyle.jh}" >
			<tbody  >
				<tr v-for="(row, rix) in rows" :key="rix">
					<!--
					<td v-for="(hd, cix) in columns" v-if="isVisible(hd)">{{cell(hd, rix, cix)}}</td>
					-->
					<td v-for="(hd, cix) in columns" v-if="isVisible(hd)" v-html='cell(hd, rix, cix)'></td>
				</tr>
			</tbody>
	  	</div>
      </table>
    </div>
	<span style='white-space: nowrap; display: flex; align-items: center; position: fixed;'>
	    <button @click="prevPage" class="float-left btn btn-outline-info btn-sm">|&lt;</button>
	    <button @click="prevPage" class="float-left btn btn-outline-info btn-sm">Previous</button>
		<input ref='pager' type='text' pattern= '[+-]?[0-9]+' placeholder="Page 0" size="2" :value="currentPage"
			title='n for the n-th page, +n for next n page, -n for the previous n page; Press [Enter] to go.'>
		/ <div >{{totalPage}}</div>
	    <button @click="nextPage" class="float-right btn btn-outline-info btn-sm">Next</button>
	    <button @click="prevPage" class="float-left btn btn-outline-info btn-sm">&gt;|</button>
	</span>
  </div>
</template>

<script>
/*eslint-disable*/
  import $ from 'jquery';

  /**[column-ix (for retrieve data), heads-ix (for find header text)] */
  var colmap = {};

  export default {
	name: 'Semantable',
	props: ['th', 'options', 'jstyle', 'debug'],	// options: {select: single}
	// component's data must be a function
	// https://stackoverflow.com/questions/42396867/how-to-get-data-to-work-when-used-within-a-component-and-axios?rq=1
	// https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function
	data: () => ({
	  columns: ['A', 'B', 'C'],
	  rows: [
		['cell-01', 'cell-02', 'cell-03'],
		['cell-11', 'cell-12', 'cell-13'],
		['cell-01', 'cell-02', 'cell-03'],
		['cell-11', 'cell-12', 'cell-13'],
		['cell-01', 'cell-02', 'cell-03'],
		['cell-11', 'cell-12', 'cell-13'],
		['cell-01', 'cell-02', 'cell-03'],
		['cell-11', 'cell-12', 'cell-13'],
		['cell-01', 'cell-02', 'cell-03'],
		['cell-11', 'cell-12', 'cell-13'],
		['cell-01', 'cell-02', 'cell-03'],
		['cell-11', 'cell-12', 'cell-13'],
	  ],
	  pageSize: 20,
	  currentPage: 0,
	  totalPage: 1
	}),

	methods:{
	  /** get column header. TODO support style */
	  head: function (hd) {
		if (colmap[hd] === undefined || colmap[hd][1] === undefined
			|| this.th === undefined)
			return hd;
		var opt = this.th[colmap[hd][1]];
		if (opt === undefined || opt.text === undefined)
			return hd;
		return opt.text;
	  },

	  /** get cell's html, with checkbox, style, etc. */
	  cell: function (hd, rix, cix) {
		if (colmap[hd] === undefined)
			return this.rows[rix][cix];
		else {
			if (this.debug)
				console.log("head: " + hd + ", rix=" + rix + ", cix=" + cix +
					", colmap[hd]: " + colmap[hd] + ", rows[rix][colmap[hd][0]]: " + this.rows[rix][colmap[hd][0]]);

			var opt = this.th[colmap[hd][1]];
			if (opt != undefined) {
				// support style
				var styl = opt.cellStyle === undefined ? '' : opt.cellStyle;
				var isChkbox = opt.check === undefined ? false : true;
				if (isChkbox)
					return '<input type="checkbox" style="' + styl + '"></input>';
			}

			// get ride of "null"
			var txt = this.rows[rix][colmap[hd][0]];
			txt = txt === null ? "" : txt;
			return '<div style="' + styl + '">' + txt + '</div>';
		}
	  },

	  isVisible: function (hd) {
		if (colmap[hd] === undefined || colmap[hd][1] === undefined)
			return true;
		if (this.th === undefined)
			return true;
		var v = this.th[colmap[hd][1]];
		if (v === undefined || v.visible === undefined)
			return true;
		return v.visible;
	  },

	  /**Bind html table with columns and rows
	   * @param {array} columns columns
	   * @param {array} rows rows
	   * @param {array} heads array of head objects, {expr, visible, text, check},
	   * where expr must presented in columns, and columns are shown in the elements sequence.
	   * If this parameter is missing, all columns will be shown.*/
	  bind: function (columns, rows, heads) {
		if (typeof heads === 'object' && heads.length !== undefined) {
			this.th = heads;
			// organize cols and rows according to heads
			// 1. new-cols holding defined heads
			var newCols = new Array(heads.length);
			for (var ix = 0; ix < heads.length; ix++) {
				if (heads[ix].expr) {
					// like: check: [undefined, heads[0]], undefined will be resolved later
					colmap[heads[ix].expr] = [undefined, ix];
					newCols[ix] = heads[ix].expr;
				}
			}

			// 2. if column doesn't exists in map, append unspecified cols - typically from rs
			// 3. else map new columns to old columns - index used for retrieve data
			for (var ix = 0; ix < columns.length; ix++) {
				if (colmap[columns[ix]] === undefined) {
					newCols.push(columns[ix]);
					colmap[columns[ix]] = [ix];
				}
				else {
					// like check: 3 (3 is provided in data columns and rows)
					colmap[columns[ix]][0] = ix;
				}
			}
		}
		Object.assign(this, {
			// working because already registered?
			// https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties

			// columns: columns,
			columns: newCols,
			rows: rows
		});
		console.log('bind(): colmap ----------------------------------- -----------------------');
		console.log(colmap);
	  },

	  query: function (heads, queryReq) {
	  },

	  dataset: function(sk, heads) {
	  },

	  sort:function(s) {
		  if(s === this.currentSort) {
			  this.currentSortDir = this.currentSortDir==='asc'?'desc':'asc';
		  }
		  this.currentSort = s;
	  },
	nextPage:function() {
		if((this.currentPage*this.pageSize) < this.users.length) this.currentPage++;
	},
	prevPage:function() {
		if(this.currentPage > 1) this.currentPage--;
	},
	goPage: function(pgEvent) {
		console.log('go page ' + this.$refs.pager.value);
		console.log(pgEvent);
	}
  },

  // computed: {
  //   sortedActivity:function() {
  //     return this.users.sort((a,b) => {
  //       let modifier = 1;
  //       if(this.currentSortDir === 'desc') modifier = -1;
  //       if(a[this.currentSort] < b[this.currentSort]) return -1 * modifier;
  //       if(a[this.currentSort] > b[this.currentSort]) return 1 * modifier;
  //       return 0;
  //     }).filter((row, index) => {
  //       let start = (this.currentPage-1)*this.pageSize;
  //       let end = this.currentPage*this.pageSize;
  //       if(index >= start && index < end) return true;
  //     });
  //   },
  //
  //   filteredList () {
  //     return this.users.filter((data) => {
  //       let email = data.email.toLowerCase().match(this.search.toLowerCase());
  //       let name = data.name.toLowerCase().match(this.search.toLowerCase());
  //       let city = data.address.city.toLowerCase().match(this.search.toLowerCase());
  //       let phone = data.phone.toLowerCase().match(this.search.toLowerCase());
  //       return email || name || city || phone;
  //     }).filter((row, index) => {
  //       let start = (this.currentPage-1)*this.pageSize;
  //       let end = this.currentPage*this.pageSize;
  //       if(index >= start && index < end) return true;
  //     });
  //   }
  // },

  created () {
    // axios.get('https://jsonplaceholder.typicode.com/users')
    //   .then(response => {
    //     this.users = response.data
    //   })
    },

  mounted () {
	this.$refs.pager.addEventListener('keypress', this.goPage);
	// colmap = {};
  },

}
</script>

<style>
	th {
		cursor:pointer;
		/* width: 500px !important; */
		white-space: nowrap;
		background-color: #fff;
		border: solid;
		border-color: #efe;
		border-left-width: 0;
		border-bottom-width: 0;
		border-right-width: 0;
		padding: 0.3em;
	}

	.table {
		border-collapse: collapse;
		background-color: #fee;
	}

	td {
		/*padding-left: 1em;*/
		border: solid;
		border-width: 1px;
		border-color: #afa;
		border-left-width: 0;
		border-right-width: 0;
		white-space: nowrap;
	}

	th:nth-child(even), td:nth-child(even) {
		background-color: #eff;
	}

</style>
