<template>
    <v-app>
        <v-content>
            <div>
                <router-link to="/">Browse</router-link>
            </div>
            <router-view></router-view>
        </v-content>
    </v-app>
</template>

<script>
export default {
    name: 'App',
};
</script>
