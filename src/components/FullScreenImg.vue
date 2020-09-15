<template>
  <div>
    <!-- To edit -->
    <!-- <img :src="mImgArr[0]" @error="onImgError(0)" @click="showImgViewer(0)" /> -->
    <v-img
      :src="mImgArr[0]"
      :lazy-src="mImgArr[0]"
      style="border-radius: 5px"
      aspect-ratio="1"
      class="grey lighten-2"
      max-width="400"
      max-height="200"
      @error="onImgError(0)"
      @click="showImgViewer(0)"
    />

    <viewer
      :options="imgViewerOptions"
      @inited="inited"
      :images="mImgArr"
      static
      class="viewer"
      ref="viewer"
    >
      <template slot-scope="scope">
        <img class="viewerImg" v-for="(src,i) in scope.images" :src="src" :key="i" />
      </template>
    </viewer>
  </div>
</template>


<style>
.viewer-loading > .viewerImg {
  display: none; /* hide big images when it is loading */
}
.viewer-toolbar > ul > .viewer-large {
  margin: 0 8px;
}
.viewerImg {
  display: none;
}
</style>
<style scoped>
/* to edit */
</style>

<script>
export default {
  props: {
    imgUrl: String,
  },

  data() {
    return {
      imgViewerOptions: {
        rotatable: true,
        movable: true,
        title: false,
        loop: false,
        backdrop: true,
        toggleOnDblclick: false,

        toolbar: {
          rotateLeft: {
            show: 1,
            size: "large",
          },
          rotateRight: {
            show: 1,
            size: "large",
          },
          oneToOne: 0,
          reset: 0,
          prev: {
            show: 1,
            size: "large",
          },
          play: 0,
          next: {
            show: 1,
            size: "large",
          },

          zoomIn: {
            show: 4,
            size: "large",
          },
          zoomOut: {
            show: 4,
            size: "large",
          },
          flipHorizontal: 0,
          flipVertical: 0,
        },
      },

      defaultImg: "",

      mImgArr: [],
    };
  },

  mounted() {
    this.mImgArr.push(this.imgUrl);
  },
  computed: {
    mainSwiper() {
      return this.$refs.mainSwiper.$swiper;
    },
  },
  methods: {
    inited(viewer) {
      this.$viewer = viewer;
    },

    showImgViewer(indx) {
      this.$viewer.view(indx);
    },

    onImgError(i) {
      this.mImgArr.splice(i, 1, this.defaultImg);
    },
  },
};
</script>
