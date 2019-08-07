<template>
  <v-layout wrap>
    <v-flex xs12>
      <v-autocomplete
        v-on:change="onChange"
        v-model="selected"
        :search-input.sync="search"
        :items="currentItems"
        chips
        :label="label"
        :item-text="itemKey"
        :item-value="itemValue"
        :return-object="returnObject"
        append-icon="search"
        no-data-text=""
        multiple
      >
        <template v-slot:selection="data">
          <v-chip
            :selected="data.selected"
            close
            class="chip--select-multi"
            @input="remove(data.item)"
          >
            {{ data.item.name }}
          </v-chip>
        </template>
        <template v-slot:item="data">
          <template v-if="typeof data.item !== 'object'">
            <v-list-tile-content v-text="data.item"></v-list-tile-content>
          </template>
          <template v-else>
            <v-list-tile-content>
              <v-list-tile-title v-if="returnObject"
                v-html="JSON.stringify(data.item)"
              ></v-list-tile-title>
              <v-list-tile-sub-title v-else v-html="data.item.name"></v-list-tile-sub-title>
              <!-- <v-list-tile-sub-title v-html="data.item.group"></v-list-tile-sub-title> -->
            </v-list-tile-content>
          </template>
        </template>
      </v-autocomplete>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  name: 'dTypeView',
  props: ['label', 'items', 'itemKey', 'itemValue', 'searchLengthP', 'returnObjectP'],
  data() {
    const searchLength = this.searchLengthP || 2;
    return {
      selected: [],
      currentItems: searchLength > 1 ? [] : this.items,
      search: null,
      searchLength,
      returnObject: this.returnObjectP || false,
    };
  },
  watch: {
    search (val) {
      if ((!val || val.length < this.searchLength) && this.searchLength > 1) {
        this.currentItems = [];
      } else {
        this.currentItems = this.items.filter((item) => {
          return item.name.indexOf(val) === 0;
        });
      }
    },
    items() {
      if (this.searchLength <= 1) {
        this.currentItems = this.items;
      }
    },
  },
  methods: {
    remove(item) {
      const index = this.selected.indexOf(item.name);
      if (index >= 0) this.selected.splice(index, 1);
    },
    onChange(selected) {
      this.$emit('change', selected);
      this.selected = [];
    },
  },
};
</script>
