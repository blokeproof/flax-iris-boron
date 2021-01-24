'use strict';
//const expect = require('chai').expect;
const mongodb = require('mongodb');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

module.exports = function (app) {

  mongoose.connect(process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true });

  let issueSchema = new mongoose.Schema({
    issue_title: {type: String, required: true},
    issue_text: {type: String, required: true},
    created_by : {type: String, required: true},
    assigned_to : String,
    status_text : String,
    open: {type: Boolean, required: true},
    created_on: {type: Date, required: true},
    updated_on: {type: Date, required: true},
    project: String
  })

  let Issue = mongoose.model('Issue', issueSchema);

    app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      let filterObject = Object.assign(req.query)
      filterObject['project'] = project
      Issue.find(
        filterObject,
        (error, issues) => {
          if(!error && issues){
            res.json(issues)
          }
        }
      )
    })
    
    .post(function (req, res){
      let project = req.params.project;
      if(!req.body.issue_title || !req.body.issue_text || !req.body.created_by){
        return res.json({ error: 'required field(s) missing' })
      }  
      let newIssue = new Issue({
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || '',
        status_text: req.body.status_text || '',
        open: true,
        created_on: new Date().toUTCString(),
        updated_on: new Date().toUTCString(),
        project: project
      })
      newIssue.save((error, savedIssue) => {
        if(!error && savedIssue){
          return res.json(savedIssue);
        }
      })  
    })

    .put(async (req, res) => {
      // checking if _id field was filled.
      if (!req.body._id) {
        return res.json({ error: "missing _id" });
      }
      // checking if any input fields is filled
      const allBlank = Object.keys(req.body).every((key) => {
        return req.body[key] === "" || key == "_id";
      });
      if (allBlank) {
        return res.json({ error: "no update field(s) sent", '_id': req.body._id });
      }
      // creating object with all the updates.
      let updateIssue = {};
      Object.keys(req.body).forEach(function (item) {
        if (req.body[item]) {
          updateIssue[item] = req.body[item];
        }
      });
      updateIssue.open = req.body.open == "true";
      updateIssue.updated_on = new Date();
      // finds and updated the entry with the new updates.
      Issue.findByIdAndUpdate(req.body._id, updateIssue, (error, result) => {
        try {
          if (!result) {
            return res.json({ error: "could not update", _id: req.body._id });
          }
          if (error) {
            return res.json({ error: "could not update", _id: req.body._id });
          }
          return res.json({ result: "successfully updated", _id: req.body._id });
        } catch (err) {
          console.log(err);
        }
      });
    })
    
  .delete(function (req, res){
    let project = req.params.project;
    if(!req.body._id){
      return res.json({ error: 'missing _id' })
    }
    Issue.findByIdAndRemove(req.body._id, (error, deletedIssue) => {
      if(!error && deletedIssue){
        return res.json( { result: 'successfully deleted', '_id': deletedIssue._id })
      }else if(!deletedIssue){
        return res.json({ error: 'could not delete', '_id': req.body._id });
      }
    })
  });
}

