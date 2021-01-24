const chaiHttp = require('chai-http');
const chai = require('chai');
let assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

	let id1 = '';
  let id2 = '';
  let invalidId = '600c9a540eab001fcd174cb';

suite('Functional Tests', function() {
 
  suite('POST /api/issues/{project} => object with issue data', function(){
		
		//Create an issue with every field: POST request to /api/issues/{project}
		test('Create an issue with every field', function(done) {
		  chai.request(server)
		  .post('/api/issues/test')
		  .send({
			issue_title: 'Title',
			issue_text: 'text',
			created_by: 'Functional Test - Every field filled in',
			assigned_to: 'Chai and Mocha',
			status_text: 'In QA'
		  })
		  .end(function(err, res){
			assert.equal(res.status, 200);
			assert.equal(res.body.issue_title, 'Title')
			assert.equal(res.body.issue_text, 'text')
			assert.equal(res.body.created_by, 'Functional Test - Every field filled in')
			assert.equal(res.body.assigned_to, 'Chai and Mocha')
			assert.equal(res.body.status_text, 'In QA')
			assert.equal(res.body.project, 'test')
			id1 = res.body._id
			done();
		  });
		});
		
		//Create an issue with only required fields: POST request to /api/issues/{project}
		test('Create an issue with only required fields', function(done) {
		  chai.request(server)
		  .post('/api/issues/test')
		  .send({
			issue_title: 'Title',
			issue_text: 'text',
			created_by: 'Functional Test - Every field filled in',
		  })
		  .end(function(err, res){
			assert.equal(res.status, 200);
			assert.equal(res.body.issue_title, 'Title')
			assert.equal(res.body.issue_text, 'text')
			assert.equal(res.body.created_by, 'Functional Test - Every field filled in')
			assert.equal(res.body.assigned_to, '')
			assert.equal(res.body.status_text, '')
			assert.equal(res.body.project, 'test')
			id2 = res.body._id
			done();
		  });
		});		
		
		//Create an issue with missing required fields: POST request to /api/issues/{project}
		test('Create an issue with missing required fields', function(done) {
		  chai.request(server)
		  .post('/api/issues/test')
		  .send({
			issue_title: 'Title'
		  })
		  .end(function(err, res){
			assert.deepEqual(res.body, { error: 'required field(s) missing' })
			done()
		  });
		});
		
	})
		
	suite('GET /api/issues/{project} => View issues on a project', function(){
		
		//View issues on a project: GET request to /api/issues/{project}
		test('View issues on a project', function(done){
		  chai
		  .request(server)
		  .get("/api/issues/test")
		  .query({})
		  .end(function(err, res){
			assert.equal(res.status, 200);
			assert.isArray(res.body);
			assert.property(res.body[0], "issue_title");
			assert.property(res.body[0], "issue_text");
			assert.property(res.body[0], "created_on");
			assert.property(res.body[0], "updated_on");
			assert.property(res.body[0], "created_by");
			assert.property(res.body[0], "assigned_to");
			assert.property(res.body[0], "open");
			assert.property(res.body[0], "status_text");
			assert.property(res.body[0], "_id");
			done();
		  })
		})		
		
		//View issues on a project with one filter: GET request to /api/issues/{project}
		test('View issues on a project with one filter', function(done) {
		  chai.request(server)
		  .get('/api/issues/test')
		  .query({created_by: 'Functional Test - Every field filled in'})
		  .end(function(err, res){
			res.body.forEach((issueResult) => {
			  assert.equal(issueResult.created_by, 'Functional Test - Every field filled in')
			})
			done()
		  });
		});		
		
		//View issues on a project with multiple filters: GET request to /api/issues/{project}
		test('View issues on a project with multiple filters', function(done){
		  chai.request(server)
		  .get('/api/issues/test')
		  .query({
			open: true,
			created_by: 'Functional Test - Every field filled in'
		  })
		  .end(function(err, res){
			res.body.forEach((issueResult) => {
			  assert.equal(issueResult.open, true)
			  assert.equal(issueResult.created_by, 'Functional Test - Every field filled in')
			})       
			done()
		  });     
		})
	
	})
	
	suite('PUT /api/issues/{project} => Update an issue', function(){
		
		//Update one field on an issue: PUT request to /api/issues/{project}
		test('Update one field on an issue', function(done) {
		  chai.request(server)
		  .put('/api/issues/test')
		  .send({
			_id: id1,
			issue_text: 'new text'
		  })
		  .end(function(err, res){
			assert.deepEqual(res.body, {  result: 'successfully updated', _id: id1 })
			done()
		  });
		});	

    //Update multiple fields on an issue: PUT request to /api/issues/{project}					
		test('Update multiple fields on an issue', function(done) {
		  chai
      .request(server)
		  .put('/api/issues/test')
		  .send({    
        _id: id2,
        issue_title: "new title",
        issue_text: "new text",
        status_text: "more new text"    
		  })
		  .end(function(err, res){
      assert.isObject(res.body)
			assert.deepEqual(res.body, {  result: 'successfully updated', _id: id2 })
			done()
		  });
		});				
		
		//Update an issue with missing _id: PUT request to /api/issues/{project}
		test('Update an issue with missing _id', function(done) {
		  chai.request(server)
		  .put('/api/issues/test')
		  .send({
			  assigned_to: 'new engineer',
        status_text: 'updated'
		  })
		  .end(function(err, res){
			assert.deepEqual(res.body, { error: 'missing _id' })
			done()
		  });     
		});

		//Update an issue with no fields to update: PUT request to /api/issues/{project}
		test('Update an issue with no fields to update', function(done) {
		  chai.request(server)
		  .put('/api/issues/test')
		  .send({
           _id: id1 
		  })
		  .end(function(err, res){
			assert.deepEqual(res.body, { error: 'no update field(s) sent', '_id': id1 })
			done()
		  });
		});
 
		//Update an issue with an invalid _id: PUT request to /api/issues/{project}
		test('Update an issue with an invalid _id', function(done) {
		  chai.request(server)
		  .put('/api/issues/test')
		  .send({
			  _id: invalidId,
        issue_title: "new title",
        issue_text: "new text",
        status_text: "more new text",
		  })
		  .end(function(err, res) {
			assert.deepEqual(res.body, { error: 'could not update', '_id': invalidId });
			done();
		  });     
		});
	})
		
	suite('DELETE /api/issues/{project} => Delete an issue', function(){
		
		//Delete an issue: DELETE request to /api/issues/{project}
		test('Delete an issue', function(done) {
		  chai.request(server)
		  .delete('/api/issues/test')
		  .send({
			_id: id1
		  })
		  .end(function(err, res) {
			//assert.equal(res.status, 200);
			assert.deepEqual(res.body, { result: 'successfully deleted', '_id': id1 });
			done();
		  });     
		});		
	
		//Delete an issue with an invalid _id: DELETE request to /api/issues/{project}
		test('Delete an issue with an invalid _id', function(done) {
		  chai.request(server)
		  .delete('/api/issues/test')
		  .send({
			_id: invalidId
		  })
		  .end(function(err, res) {
			//assert.equal(res.status, 200);
			assert.deepEqual(res.body, { error: 'could not delete', '_id': invalidId });
			done();
		  });     
		});			
		
		//Delete an issue with missing _id: DELETE request to /api/issues/{project}
		test('Delete an issue with missing _id', function(done) {
		  chai
      .request(server)
		  .delete('/api/issues/test')
		  .send({
		  })
		  .end(function(err, res){
			assert.deepEqual(res.body, { error: 'missing _id' })
			done()
		  });     
		});				
	})

});
