<template>
  <v-container>
    <Alert ref="alert" />
    <v-form ref="form">
      <v-card class="mb-5">
        <v-card-text>
          <v-autocomplete
            :search-input.sync="workflowName"
            v-model="workflow"
            label="Select flow from RapidPro"
            :items="workflows"
            :rules="[rules.required]"
          >
          </v-autocomplete>

          How often should this workflow be sent?

          <v-radio-group row v-model="frequency" :rules="[rules.required]">
            <v-radio label="Once" value="once"></v-radio>
            <v-radio label="Recurring" value="recurring"></v-radio>
          </v-radio-group>
          <v-row v-if="recurring">
            <v-col cols="2">
              <v-select v-model="period" label="Period" :items="items" />
            </v-col>
            <v-col cols="3">
              <v-text-field
                v-model="frequencyAmount"
                prefix="Recur every"
                :suffix="frequencySuffix"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row v-if="recurring" v-model="showRecurringOptions">
            <v-col cols="1" />
            <v-checkbox
              v-for="item in recurringOptions"
              :key="item"
              class="mx-2"
              :label="item"
              :value="item"
              v-model="frequencySpecifics"
            />
          </v-row>
        </v-card-text>
      </v-card>

      <v-card>
        <v-card-title>
          Practitioners
          <v-spacer></v-spacer>
          <v-text-field
            v-model="search"
            append-icon="search"
            label="Search"
            single-line
            hide-details
          ></v-text-field>
        </v-card-title>
        <v-data-table
          v-model="selected"
          :loading="loading"
          loading-text="Loading....Please wait"
          :headers="headers"
          :items="practitioners"
          :search="search"
          item-key="id"
          show-select
          class="elevation-1"
        ></v-data-table>
        <v-card-actions class="secondary">
          <v-spacer></v-spacer>
          <v-btn @click="nextStep">Review Selection</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-container>
</template>

<script>
import axios from "axios";

import Alert from "@/components/Layout/Alert.vue";
import Practitioner from "@/mixins/Practitioner.js";

export default {
  components: {
    Alert
  },
  computed: {
    frequencySuffix() {
      if (this.period) {
        let suffix = this.period.substring(0, this.period.length - 1) + "(s)";

        if (this.period === "weeks") {
          suffix += " on ";
        }

        return suffix;
      }

      return null;
    },
    recurring() {
      return this.frequency === "recurring";
    },
    recurringOptions() {
      if (this.frequency !== "recurring") {
        return [];
      }

      if (this.period === "weeks") {
        return [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday"
        ];
      }

      return [];
    },
    showRecurringOptions() {
      return this.frequency === "recurring" && this.period === "weeks";
    }
  },
  created() {
    const config = require("@/config/config.json");

    axios
      .get(config.backend + "/mhero/workflows")
      .then(response => {
        let workflows = [];

        if (
          !response ||
          !Object.prototype.hasOwnProperty.call(response, "data") ||
          !Object.prototype.hasOwnProperty.call(response.data, "entry") ||
          !response.data.entry.length
        ) {
          this.$refs.alert.changeMessage(
            "No workflows found. Messages will not be sent.",
            "error"
          );

          return;
        }

        response.data.entry.forEach(workflow => {
          let id = workflow.resource.id;
          let value = null;

          for (var i in workflow.resource.extension[0].extension) {
            let extension = workflow.resource.extension[0].extension[i];

            if (extension.url === "name") {
              value = extension.valueString;
              break;
            }
          }

          workflows.push({
            text: value,
            value: id
          });
        });

        this.workflows = workflows;
      })
      .catch(() => {
        this.$refs.alert.changeMessage(
          "Could not get workflows from server.",
          "error"
        );
      });

    axios.get(config.backend + "/practitioner/all").then(response => {
      let practitioners = [];

      if (
        !response ||
        !Object.prototype.hasOwnProperty.call(response, "data") ||
        !response.data.length
      ) {
        this.$refs.alert.changeMessage(
          "No practitioners found. Messages will not be sent.",
          "error"
        );
        return;
      }

      response.data.forEach(record => {
        let practitioner = record._source;

        let cadre = "";
        let contactGroup = "";
        let facility = "";
        let id = practitioner.practitioner.slice(
          practitioner.practitioner.lastIndexOf("/") + 1
        );
        let jurisdiction = "";
        let name = "";
        let organization = "";
        let phone = "";

        // get the name of the practitioner
        if (practitioner.given) {
          name = practitioner.given;
        }

        if (practitioner.family) {
          name += " " + practitioner.family;
        }

        name = name.trim();

        if (practitioner.facilityName) {
          facility = practitioner.facilityName;
        }

        if (practitioner.positionTitle) {
          cadre = practitioner.positionTitle;
        }

        if (practitioner.phone) {
          phone = practitioner.phone;
        }

        if (name) {
          practitioners.push({
            cadre: cadre,
            contactGroup: contactGroup,
            facility: facility,
            id: id,
            jurisdiction: jurisdiction,
            name: name,
            phone: phone,
            organization: organization
          });
        }
      });

      this.practitioners = practitioners;
      this.loading = false;
    });
  },
  data() {
    return {
      frequency: false,
      frequencyAmount: null,
      frequencySpecifics: [],
      headers: [
        { text: "Name", value: "name" },
        { text: "Jurisdiction", value: "jurisdiction" },
        { text: "Facility", value: "facility" },
        { text: "Cadre", value: "cadre" },
        { text: "Organizational Affiliation", value: "organization" },
        { text: "Phone Number", value: "phone" },
        { text: "Contact Group", value: "contactGroup" }
      ],
      items: ["hours", "days", "weeks"],
      loading: true,
      period: null,
      practitioners: [],
      rules: {
        required: value => {
          if (value) {
            return true;
          }

          return "Field is required";
        }
      },
      search: null,
      selected: [],
      workflow: null,
      workflowName: null,
      workflows: []
    };
  },
  methods: {
    nextStep() {
      if (this.$refs.form.validate()) {
        this.$emit(
          "nextStep",
          this.selected,
          this.frequency,
          this.frequencyAmount,
          this.period,
          this.workflow,
          this.workflowName,
          this.frequencySpecifics
        );
      }
    }
  },
  mixins: [Practitioner]
};
</script>
