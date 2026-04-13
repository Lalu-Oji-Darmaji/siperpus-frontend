<template>
    <div id="app">
        <!-- RouterView merender komponen halaman sesuai URL saat ini -->
        <!-- Inilah inti dari SPA: satu App, konten berganti via Router -->
        <RouterView />
    </div>
</template>

<style>
*,
*::before,
*::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
    background: #F8FAFC;
    color: #1E293B;
    line-height: 1.6;
}

#app {
    min-height: 100vh;
}
</style>