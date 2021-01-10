require('dotenv').config();
const knex = require('knex');

const knexInstance = knex({
	client: 'pg',
	connection: process.env.DB_URL,
});

const searchTerm = '';

function searchByText(searchTerm) {
	knexInstance
		.select('id', 'name', 'price', 'date_added', 'checked', 'category')
		.from('shopping_list')
		.where('name', 'ILIKE', `%${searchTerm}%`)
		.then((result) => {
			console.log('SEARCH TERM', { searchTerm });
			console.log(result);
		});
}

// searchByText('');

function paginateItems(pageNumber) {
	const itemsPerPage = 6;
	const offset = itemsPerPage * (pageNumber - 1);
	knexInstance
		.select('id', 'name', 'price', 'date_added', 'checked', 'category')
		.from('shopping_list')
		.limit(itemsPerPage)
		.offset(offset)
		.then((result) => {
			console.log('PAGINATE ITEMS', { page });
			console.log(result);
		});
}

// paginateItems(5);

function getItemsAddedAfterDate(daysAgo) {
	knexInstance
		.select('id', 'name', 'price', 'date_added', 'checked', 'category')
		.where(
			'date_added',
			'>',
			knexInstance.raw(`now() - '??'::INTERVAL`, daysAgo)
		)
		.from('shopping_list')
		.orderBy([{ column: 'date_added', order: 'ASC' }])
		.then((result) => {
            console.log('PRODUCTS ADDED DAYS AGO')
			console.log(result);
		});
}

// getItemsAddedAfterDate(5);

function getCostForCategory() {
	knexInstance
		.select('category')
		.sum('price as total')
		.from('shopping_list')
		.groupBy('category')
		.then((result) => {
			console.log('COST PER CATEGORY');
			console.log(result);
		});
}
