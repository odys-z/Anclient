<template ref='semantbl'>
  <div class="col-md-12" ref='semantbl'>
    <div class="table-responsive">
      <table class="table table-striped table-bordered" style="width:100%">
          <thead width="100%">
              <tr>
                <th v-for="key in columns" :key="key" ><i class="fas fa-sort-alpha-down float-right">{{key}}</i></th>
              </tr>
          </thead>
          <tbody>
              <tr v-for="(row, index) in rows" :key="index">
                <td v-for="cell in row">{{cell}}</td>
              </tr>
          </tbody>
      </table>
    </div>
	<span style='white-space: nowrap; display: flex; align-items: center;'>
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

  export default {
	name: 'Semantable',
	// component's data must be a function
	// https://stackoverflow.com/questions/42396867/how-to-get-data-to-work-when-used-within-a-component-and-axios?rq=1
	// https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function
	data: () => ({
	  columns: ['col-a', 'col-b', 'C'],
	  rows: [
		['cell-01', 'cell-02', 'cell-03'],
		['cell-11', 'cell-12', 'cell-13'],
		['cell-21', 'cell-22', 'cell-23'],
		['cell-31', 'cell-32', 'cell-33'],
		['cell-41', 'cell-42', 'cell-43'],
	  ],
	  pageSize: 5,
	  currentPage: 0,
	  totalPage: 0
	}),

	methods:{
	  bind: function (columns, rows) {
		console.log(this);
		Object.assign(this, {
			// working because already registered?
			// https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties
			columns: columns,
			rows: rows
		});
		console.log(this);
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
		padding-left: 3em;
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
