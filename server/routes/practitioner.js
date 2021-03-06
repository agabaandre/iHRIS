var express = require("express");
var router = express.Router();
var axios = require("axios");
var elasticsearch = require("elasticsearch");

const URI = require('urijs');
const fs = require('fs')
const mixin = require("../mixin");
const env = process.env.NODE_ENV || 'development';

var config = require(__dirname + '/../config/config.json')[env];

if (env === "production") {
  config = JSON.parse(fs.readFileSync(`/run/secrets/server_config`, 'utf8'))[env];
}

router.post("/add/work-history", function (req, res, next) {
  let data = req.body;
  data["resourceType"] = "PractitionerRole";

  let url = URI(config.fhir.server).segment('fhir').segment('PractitionerRole').toString()
  axios.post(url, data, {
    withCredentials: true,
    auth: {
      username: config.fhir.username,
      password: config.fhir.password
    }
  }).then(response => {
    res.status(201).json(response.data);
  }).catch(err => {
    res.status(400).json(err);
  });
});

/**
 * Delete a work history element
 */
router.post("/delete/work-history", function (req, res, next) {
  let data = req.body;

  let url = URI(config.fhir.server).segment('fhir').segment('PractitionerRole').segment(data.id).toString()
  axios.delete(url, {
    withCredentials: true,
    auth: {
      username: config.fhir.username,
      password: config.fhir.password
    }
  }).then(response => {
    res.status(201).json(response.data);
  }).catch(err => {
    res.status(400).json(err);
  });
});

var client = new elasticsearch.Client({
  host: config.elastic.server,
  log: 'trace',
  apiVersion: config.elastic.version
});

router.get("/all", async function (req, res, next) {
  let practitioners = [];
  let scroll = null;
  const size = 1000;

  let response = await client.search({
    index: "practitioner",
    scroll: "1m",
    size: size
  });

  practitioners = response.hits.hits;

  while (response.hits.hits.length === size) {
    response = await client.scroll({
      scroll: "1m",
      scrollId: response._scroll_id
    });

    practitioners = practitioners.concat(response.hits.hits);
  }

  res.status(201).json(practitioners);
});

router.get("/describe/page", function (req, res, next) {
  let url = URI(config.fhir.server).segment('fhir').segment('Basic').segment('iHRISPagePractitioner').toString();

  axios.get(url, {
    params: {},
    withCredentials: true,
    auth: {
      username: config.fhir.username,
      password: config.fhir.password
    }
  }).then(response => {
    res.status(201).json(response.data);
  }).catch(err => {
    res.status(400).json(err);
  });
});

router.get("/describe/definition/:definition", function (req, res, next) {
  mixin.getDefinition("StructureDefinition", req.params.definition, (err, definition) => {
    if (err) {
      res.status(400).json(err);
    } else {
      res.status(201).json(definition);
    }
  })
});

/**
 * Get a specific practitioner
 */
router.get("/view/:id", function (req, res, next) {
  let id = req.params.id;

  let url = URI(config.fhir.server).segment('fhir').segment('Practitioner');
  url.addQuery('_id', id);
  url = url.toString();

  let credentials = {
    withCredentials: true,
    auth: {
      username: config.fhir.username,
      password: config.fhir.password
    }
  };

  axios.get(url, credentials).then(data => {
    if (data === null) {
      res.status(400).json("No practitioner found.");
    } else {
      // get the practitioner roles (ie, work history)
      let url = URI(config.fhir.server).segment('fhir').segment('PractitionerRole');
      url.addQuery('practitioner', id);
      url = url.toString();

      axios.get(url, credentials).then(response => {
        let practitioner = data.data;

        if (response.data.entry) {
          let workHistory = [];
          response.data.entry.forEach(job => {
            workHistory.push(job.resource);
          });

          practitioner.entry[0].resource.workHistory = workHistory;
        }

        res.status(201).json(practitioner);
      });
    }
  });
});

/**
 * Add a new practitioner
 */
router.post("/add", function (req, res, next) {
  let data = req.body;
  data["resourceType"] = "Practitioner";

  let url = URI(config.fhir.server).segment('fhir').segment('Practitioner').toString()
  axios.post(url, data, {
    withCredentials: true,
    auth: {
      username: config.fhir.username,
      password: config.fhir.password
    }
  }).then(response => {
    res.status(201).json(response.data);
  }).catch(err => {
    res.status(400).json(err);
  });
});

/**
 * Edit an existing practitioner
 */
router.post("/edit", function (req, res, next) {
  let data = req.body;
  data["resourceType"] = "Practitioner";
  let url = URI(config.fhir.server).segment('fhir').segment('Practitioner').segment(data.id).toString()
  axios.put(url, data, {
    withCredentials: true,
    auth: {
      username: config.fhir.username,
      password: config.fhir.password
    }
  }).then(response => {
    res.status(201).json(response.data);
  }).catch(err => {
    res.status(400).json(err);
  });
});

/**
 * Edit a practitioner's work history
 */
router.post("/edit/work-history", function (req, res, next) {
  let data = req.body;
  data["resourceType"] = "PractitionerRole";

  let url = URI(config.fhir.server).segment('fhir').segment('PractitionerRole').segment(data.id).toString();

  axios.put(url, data, {
    withCredentials: true,
    auth: {
      username: config.fhir.username,
      password: config.fhir.password
    }
  }).then(response => {
    res.status(201).json(response.data);
  }).catch(err => {
    res.status(400).json(err);
  });
});

/**
 * Search for practitioners
 */
router.get("/search", async function (req, res, next) {
  let query_params = req._parsedUrl.query;
  if(!query_params){
    res.status(400).json({message: "No search criteria submitted"});
    return;
  }
  query_params = query_params.split('&');
  let query_objects = query_params.map(query_str => {
    let obj = new Object();
    let q = query_str.split("=");
    obj[q[0]] = q[1];
    return obj;
  });

  let query = {}
  query["must"] = []
  query_objects.forEach(obj => {
    if(Object.keys(obj)[0] === "family") {
      query["must"].push({
        wildcard: {
          family: `*${obj.family}*`
        }
      });
    }
    if(Object.keys(obj)[0] == "organization") {
      query["must"].push({
        match: {
          facilityName: {
            query: obj.organization,
            operator: "AND"
          }
        }
      });
    }
  });


  let practitioners = [];
  let scroll = null;
  const size = 1000;

  let response = await client.search({
    index: "practitioner",
    scroll: "1m",
    size: size,
    body: {
      query: {
        bool: query
      }
    }
  });

  practitioners = response.hits.hits;

  while (response.hits.hits.length === size) {
    response = await client.scroll({
      scroll: "1m",
      scrollId: response._scroll_id
    });

    practitioners = practitioners.concat(response.hits.hits);
  }

  res.status(201).json(practitioners);
});

module.exports = router;
