<template>
    <div>
        <span>{{shortened}}  </span>
        <v-icon
            small
            class='mr-2'
            @click='clipboardCopy()'
        >
            fa-copy
        </v-icon>
        <v-icon
            small
            class='mr-2'
            @click='goRoute()'
        >
            launch
        </v-icon>
    </div>
</template>

<script>
export default {
    props: ['value', 'baseUrl'],
    computed: {
        shortened() {
            return this.value.substring(0, 6);
        },
    },
    methods: {
        clipboardCopy: function() {
            var textArea = document.createElement("textarea");
            textArea.value = this.value;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
            } catch (err) {
                console.log('Oops, unable to copy');
            }
            document.body.removeChild(textArea);
        },
        goRoute: function() {
            window.open(`${this.baseUrl}${this.value}`, '_blank');
        },
    },
}
</script>
