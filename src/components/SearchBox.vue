<template>
  <ais-index app-id="OU413LC7SR" api-key="11ed9b1e149370761f2ca223ef2b615a" index-name="test">
    <ais-search-box></ais-search-box>
    <ais-results>
      <template slot-scope="{ result }">
        <h2>
          <ais-highlight :result="result" attribute-name="name"></ais-highlight>
        </h2>
      </template>
    </ais-results>
  </ais-index>
</template>
