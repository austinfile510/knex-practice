const { expect } = require('chai');
const knex = require('knex');
const ShoppingListService = require('../src/shopping-list-service');

describe.only('Shopping List Service object', function () {
	let db;

	let testItems = [
		{
			id: 1,
			name: 'Fish tricks',
			price: '13.10',
			date_added: new Date('2020-12-22 19:29:03'),
			checked: false,
			category: 'Main',
		},
		{
			id: 2,
			name: 'Not Dogs',
			price: '4.99',
			date_added: new Date('2020-12-22 19:29:03'),
			checked: false,
			category: 'Snack',
		},
		{
			id: 3,
			name: 'Bluffalo Wings',
			price: '5.50',
			date_added: new Date('2020-12-22 19:29:03'),
			checked: false,
			category: 'Snack',
		},
	];

	before(() => {
		db = knex({
			client: 'pg',
			connection: process.env.TEST_DB_URL,
		});
	});

	before(() => db('shopping_list').truncate());
	
	afterEach(() => db('shopping_list').truncate());

	after(() => db.destroy());

	context(`Given 'shopping_list' has data`, () => {
		beforeEach(() => {
			return db.into('shopping_list').insert(testItems);
		});
		it(`getAllItems() resolves all items from 'shopping_list' table`, () => {
			return ShoppingListService.getAllItems(db).then((actual) => {
				expect(actual).to.eql(testItems);
			});
		});
		it(`getById() resolves an item by id from 'shopping_list' table`, () => {
			const thirdId = 3;
			const thirdTestItem = testItems[thirdId - 1];
			return ShoppingListService.getById(db, thirdId).then((actual) => {
				expect(actual).eql({
					id: thirdId,
					name: thirdTestItem.name,
					price: thirdTestItem.price,
					date_added: thirdTestItem.date_added,
					checked: false,
					category: thirdTestItem.category,
				});
			});
		});
		it(`deleteItem() removes an item by id from 'shopping_list' table`, () => {
			const idToDelete = 3;
			return ShoppingListService.deleteItem(db, idToDelete)
			  .then(() => ShoppingListService.getAllItems(db))
			  .then(allItems => {
				// copy the test items array without the removed item
				const expected = testItems
				  .filter(item => item.id !== idToDelete)
				  .map(item => ({
					...item,
					checked: false,
				  }));
				expect(allItems).to.eql(expected);
			  });
		  });
		  it(`updateItem() updates an item in the 'shopping_list' table`, () => {
			const idOfItemToUpdate = 3;
			const newItemData = {
			  name: 'updated title',
			  price: '99.99',
			  date_added: new Date(),
			  checked: true,
			};
			const originalItem = testItems[idOfItemToUpdate - 1];
			return ShoppingListService.updateItem(db, idOfItemToUpdate, newItemData)
			  .then(() => ShoppingListService.getById(db, idOfItemToUpdate))
			  .then(item => {
				expect(item).to.eql({
				  id: idOfItemToUpdate,
				  ...originalItem,
				  ...newItemData,
				});
			  });
		  });
	});
	context(`Given 'shopping_list' has no data`, () => {
		it(`getAllItems() resolves an empty array`, () => {
		  return ShoppingListService.getAllItems(db)
			.then(actual => {
			  expect(actual).to.eql([]);
			});
		});
	
		it(`insertItem() inserts an item and resolves it with an 'id'`, () => {
		  const newItem = {
			name: 'Test new name name',
			price: '5.05',
			date_added: new Date('2020-01-01T00:00:00.000Z'),
			checked: true,
			category: 'Lunch',
		  };
		  return ShoppingListService.insertItem(db, newItem)
			.then(actual => {
			  expect(actual).to.eql({
				id: 1,
				name: newItem.name,
				price: newItem.price,
				date_added: newItem.date_added,
				checked: newItem.checked,
				category: newItem.category,
			  });
			});
		});
	  });
});
