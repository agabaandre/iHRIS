<template>
  <v-form ref="form" v-if="data">
    <div v-for="field in sanitizedFields" v-bind:key="name + '-' + field.id">
      <Base64Binary
        v-if="field.type == 'base64Binary'"
        :label="field.label"
        :max="field.max"
        :required="field.required"
        :ref="field.name"
        :hint="field.short"
        :value="field.value"
      />

      <Boolean
        v-if="field.type == 'boolean'"
        :label="field.label"
        ref="active"
        :hint="field.short"
        :value="field.value"
        :fieldName="field.name"
        :formName="name"
        @validationTriggered="runValidation($event)"
      />

      <Canonical
        v-if="field.type == 'canonical'"
        :label="field.label"
        :max="field.max"
        :required="field.required"
        :ref="field.name"
        :hint="field.short"
        :value="field.value"
      />

      <Code
        v-if="field.type == 'code'"
        :label="field.label"
        :max="field.max"
        :required="field.required"
        :codes="field.options"
        :ref="field.name"
        :hint="field.short"
        :value="field.value"
      />

      <Date
        v-if="field.type == 'date'"
        :label="field.label"
        :max="field.max"
        :required="field.required"
        :ref="field.name"
        :fieldName="field.name"
        :hint="field.short"
        :value="field.value"
        :formName="name"
      />

      <DateTime
        v-if="field.type && field.type.toLowerCase() == 'datetime'"
        :label="field.label"
        :max="field.max"
        :required="field.required"
        :ref="field.name"
        :fieldName="field.name"
        :hint="field.short"
        :value="field.value"
        :formName="name"
      />

      <Decimal
        v-if="field.type == 'decimal'"
        :label="field.label"
        :max="field.max"
        :required="field.required"
        :ref="field.name"
        :hint="field.short"
        :value="field.value"
      />

      <Id
        v-if="field.type == 'id'"
        :label="field.label"
        :max="field.max"
        :required="field.required"
        :ref="field.name"
        :hint="field.short"
        :value="field.value"
      />

      <Instant
        v-if="field.type == 'instant'"
        :label="field.label"
        :max="field.max"
        :required="field.required"
        :ref="field.name"
        :hint="field.short"
        :value="field.value"
      />

      <Integer
        v-if="field.type == 'integer'"
        :label="field.label"
        :max="field.max"
        :required="field.required"
        :ref="field.name"
        :hint="field.short"
        :value="field.value"
      />

      <Markdown
        v-if="field.type == 'markdown'"
        :label="field.label"
        :max="field.max"
        :required="field.required"
        :ref="field.name"
        :hint="field.short"
        :value="field.value"
      />

      <Oid
        v-if="field.type == 'oid'"
        :label="field.label"
        :max="field.max"
        :required="field.required"
        :ref="field.name"
        :hint="field.short"
        :value="field.value"
      />

      <Password
        v-if="field.type == 'password'"
        :label="field.label"
        :max="field.max"
        :required="field.required"
        :ref="field.name"
        :value="field.value"
        :hint="field.short"
        :matching="field.matching"
      />

      <PositiveInt
        v-if="field.type == 'positiveint'"
        :label="field.label"
        :max="field.max"
        :required="field.required"
        :ref="field.name"
        :value="field.value"
        :hint="field.short"
      />

      <Reference
        v-if="field.type === 'Reference'"
        :label="field.label"
        :max="field.max"
        :required="field.required"
        :ref="field.name"
        :value="field.value"
        :hint="field.short"
        :structureDefinition="field.reference"
        :fieldName="field.name"
        :formName="name"
        @validationTriggered="runValidation($event)"
      />

      <String
        v-if="field.type == 'string'"
        :label="field.label"
        :max="field.max"
        :required="field.required"
        :ref="field.name"
        :value="field.value"
        :hint="field.short"
        :fieldName="field.name"
        :formName="name"
      />

      <Time
        v-if="field.type == 'time'"
        :label="field.label"
        :max="field.max"
        :required="field.required"
        :ref="field.name"
        :value="field.value"
        :hint="field.short"
      />

      <UnsignedInt
        v-if="field.type == 'unsignedint'"
        :label="field.label"
        :max="field.max"
        :required="field.required"
        :ref="field.name"
        :value="field.value"
        :hint="field.short"
      />

      <Uri
        v-if="field.type == 'uri'"
        :label="field.label"
        :max="field.max"
        :required="field.required"
        :ref="field.name"
        :value="field.value"
        :hint="field.short"
      />

      <Url
        v-if="field.type == 'url'"
        :label="field.label"
        :max="field.max"
        :required="field.required"
        :ref="field.name"
        :value="field.value"
        :hint="field.short"
      />

      <Uuid
        v-if="field.type == 'uuid'"
        :label="field.label"
        :max="field.max"
        :required="field.required"
        :ref="field.name"
        :value="field.value"
        :hint="field.short"
      />
    </div>

    <v-layout align-center justify-end fill-height>
      <v-btn v-if="!hideCancel" @click="cancel">{{ this.cancelLabel }}</v-btn>
      <v-btn @click="submit" class="primary">{{ this.submitLabel }}</v-btn>
    </v-layout>
  </v-form>
</template>

<script>
import Base64Binary from "@/components/Form/Base64Binary.vue";
import Boolean from "@/components/Form/Boolean.vue";
import Capitalize from "@/mixins/Capitalize.js";
import Canonical from "@/components/Form/Canonical.vue";
import Code from "@/components/Form/Code.vue";
import Date from "@/components/Form/Date.vue";
import DateTime from "@/components/Form/DateTime.vue";
import Decimal from "@/components/Form/Decimal.vue";
import Id from "@/components/Form/Id.vue";
import Instant from "@/components/Form/Instant.vue";
import Integer from "@/components/Form/Integer.vue";
import Markdown from "@/components/Form/Markdown.vue";
import Oid from "@/components/Form/Oid.vue";
import Password from "@/components/Form/Password.vue";
import PositiveInt from "@/components/Form/PositiveInt.vue";
import Reference from "@/components/Form/Reference.vue";
import String from "@/components/Form/String.vue";
import StructureDefinition from "@/mixins/StructureDefinition.js";
import Time from "@/components/Form/Time.vue";
import UnsignedInt from "@/components/Form/UnsignedInt.vue";
import Uri from "@/components/Form/Uri.vue";
import Url from "@/components/Form/Url.vue";
import Uuid from "@/components/Form/Uuid.vue";

export default {
  components: {
    Base64Binary,
    Boolean,
    Canonical,
    Code,
    Date,
    DateTime,
    Decimal,
    Id,
    Instant,
    Integer,
    Markdown,
    Oid,
    Password,
    PositiveInt,
    Reference,
    String,
    Time,
    UnsignedInt,
    Uri,
    Url,
    Uuid
  },
  computed: {
    sanitizedFields() {
      let data = [];

      this.data.forEach(element => {
        if (element.max != 0) {
          data.push(element);
        }
      });
      return data;
    }
  },
  created() {
    this.changeFields(this.fields);
  },
  data() {
    return {
      active: true,
      data: {},
      inputs: [],
      use: ""
    };
  },
  methods: {
    cancel() {
      this.$emit("cancel");
    },
    changeFields(fields) {
      let inputs = [];
      let sanitized = [];

      if (fields) {
        for (var key in fields) {
          inputs.push(fields[key]);

          if (fields[key].labelOverride) {
            fields[key].label = fields[key].labelOverride;
          } else {
            let data = fields[key].name.replace(/([A-Z])/g, " $1");
            fields[key].label = this.capitalize(data);
          }

          sanitized.push(fields[key]);
        }
      }

      this.data = sanitized;
      this.inputs = inputs;
    },
    collapseFields(fields) {
      let collapsedFields = [];

      for (var key in fields) {
        if (fields[key] && fields[key].fields) {
          let subfields = this.collapseFields(
            fields[key].fields,
            fields[key].name
          );

          for (var j in subfields) {
            collapsedFields.push(subfields[j]);
          }
        } else {
          collapsedFields.push(fields[key]);
        }
      }

      return collapsedFields;
    },
    getInputs() {
      let inputs = {};

      for (var field of this.inputs) {
        let key = null;
        let name = field.name;

        if (
          this.primitiveTypes.indexOf(field.parentType) < 0 &&
          field.parentType !== null &&
          field.parentType !== undefined
        ) {
          key = field.id.toLowerCase();
        } else {
          key = field.name;
        }

        if (this.$refs[name]) {
          inputs[key] = this.$refs[name][0].getInput();
        }
      }

      return inputs;
    },
    getName() {
      return this.name;
    },
    reset() {
      this.$refs.form.reset();
    },
    submit() {
      if (this.$refs.form.validate()) {
        this.$emit("successfulSubmit", this.getInputs());
      } else {
        this.$emit("failedSubmit");
      }
    },
    runValidation(event) {
      for (var index in this.validationRules) {
        var oRule = this.validationRules[index];
        if (
          oRule.formName.toLowerCase() == event.formName.toLowerCase() &&
          oRule.sourceFieldName.toLowerCase() == event.fiedlName.toLowerCase()
        ) {
          var condition = oRule.condition;
          switch (condition) {
            case "eq":
              if (event.value === oRule.value) {
                this.applyBehaviour(
                  oRule.behavior,
                  oRule.targetFieldName,
                  oRule.formName,
                  false
                );
              } else {
                this.applyBehaviour(
                  oRule.behavior,
                  oRule.targetFieldName,
                  oRule.formName,
                  true
                );
              }
              break;
            case "ne":
              if (event.value !== oRule.value) {
                this.applyBehaviour(
                  oRule.behavior,
                  oRule.targetFieldName,
                  oRule.formName,
                  false
                );
              }
              break;
          }
        }
      }
    },
    applyBehaviour(behavior, fieldName, formName, reverse) {
      var sanitizedFieldId = "";
      sanitizedFieldId =
        fieldName.split(".").length > 0
          ? fieldName.replace(/\./g, "_")
          : fieldName;
      sanitizedFieldId = (formName + "_" + sanitizedFieldId).toLowerCase();
      if (!reverse) {
        switch (behavior) {
          case "hide":
            document.getElementById(sanitizedFieldId).style.visibility =
              "hidden";
            break;
          case "show":
            document.getElementById(sanitizedFieldId).style.visibility =
              "visible";
            break;
          case "disable":
            document.getElementById(sanitizedFieldId).disabled = true;
            break;
          case "enable":
            document.getElementById(sanitizedFieldId).disabled = false;
            break;
        }
      } else {
        switch (behavior) {
          case "hide":
            document.getElementById(sanitizedFieldId).style.visibility =
              "visible";
            break;
          case "show":
            document.getElementById(sanitizedFieldId).style.visibility =
              "hidden";
            break;
          case "disable":
            document.getElementById(sanitizedFieldId).disabled = false;
            break;
          case "enable":
            document.getElementById(sanitizedFieldId).disabled = true;
            break;
        }
      }
    }
  },
  props: {
    cancelLabel: {
      default: "cancel"
    },
    fields: {},
    hideCancel: {
      default: false
    },
    name: {},
    submitLabel: {
      default: "Submit"
    },
    validationRules: {}
  },
  mixins: [Capitalize, StructureDefinition]
};
</script>
<style>
.primary {
  margin-left: 10px;
}
</style>
