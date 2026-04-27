<template>
  <div class="katalog-page">
    <div class="page-header">
      <h1 class="text-3xl font-bold tracking-tight text-slate-900">Katalog Buku</h1>
      <p class="text-muted-foreground">{{ infoHasil }}</p>
    </div>

    <div class="toolbar flex flex-wrap gap-4 mb-8">
      <div class="search-wrap relative flex-1">
        <input
          v-model.trim="kataCari"
          v-focus
          type="text"
          placeholder="Cari judul atau penulis..."
          class="input-search w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          @keyup.escape="kataCari = ''"
        />
        <button
          v-if="kataCari"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          @click="kataCari = ''"
        >
          ✖
        </button>
      </div>

      <select v-model="filterKategori" class="select-filter px-4 py-2 border rounded-lg bg-white">
        <option value="">Semua Kategori</option>
        <option v-for="kat in daftarKategori" :key="kat" :value="kat">
          {{ kat }}
        </option>
      </select>

      <div class="filter-status flex gap-2">
        <Button
          v-for="s in statusOptions"
          :key="s.value"
          :variant="filterStatus === s.value ? 'default' : 'outline'"
          @click="filterStatus = s.value"
        >
          {{ s.label }}
        </Button>
      </div>
    </div>

    <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="n in 8" :key="n" class="bg-slate-100 animate-pulse rounded-xl"></div>
    </div>

    <div v-else-if="bukuTerfilter.length === 0" class="state-kosong py-20 text-center">
      <p class="text-lg text-slate-500 mb-4">📭 Tidak ada buku yang cocok dengan pencarian Anda.</p>
      <Button @click="resetFilter">Reset Filter</Button>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <KartuBuku
        v-for="buku in bukuTerfilter"
        :key="buku.id"
        :buku="buku"
        @lihat-detail="lihatDetail"
        @pinjam="pinjamBuku"
      />
    </div>

    <div class="mt-10">
      <Button
        variant="ghost"
        @click="panelFilterTerbuka = !panelFilterTerbuka"
      >
        {{ panelFilterTerbuka ? 'Sembunyikan' : 'Tampilkan' }} Filter Lanjutan
      </Button>

      <div v-show="panelFilterTerbuka" class="panel-filter-lanjutan mt-4 p-6 border rounded-xl bg-slate-50 flex gap-6 items-center flex-wrap">
        <h4 class="font-semibold">Filter Lanjutan</h4>
        <div class="flex items-center gap-2">
          <label class="text-sm text-slate-600">Tahun dari:</label>
          <input v-model.number="filterTahunDari" type="number" class="w-20 p-1 border rounded" />
        </div>
        <div class="flex items-center gap-2">
          <label class="text-sm text-slate-600">Sampai:</label>
          <input v-model.number="filterTahunSampai" type="number" class="w-20 p-1 border rounded" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { vFocus } from '@/directives/vFocus'
import { Button } from '@/components/ui/button'
import { vHighlight } from '@/directives/vHighlight'
import KartuBuku from '@/components/buku/KartuBuku.vue'

// --- STATE & DATA (Tetap sama seperti kode asli Anda) ---
const kataCari = ref('')
const filterKategori = ref('')
const filterStatus = ref('semua')
const filterTahunDari = ref(null)
const filterTahunSampai = ref(null)
const panelFilterTerbuka = ref(false)
const isLoading = ref(false)
const tahunSekarang = new Date().getFullYear()

const statusOptions = [
  { label: 'Semua', value: 'semua' },
  { label: 'Tersedia', value: 'tersedia' },
  { label: 'Dipinjam', value: 'dipinjam' }
]

const daftarBuku = ref([
  { id: 1, judul: 'Clean Code', penulis: 'Robert C. Martin', kategori: 'Teknologi', penerbit: 'Prentice Hall', tahun: 2008, tersedia: true, sinopsis: 'Panduan menulis kode yang rapi dan mudah dipelihara.' },
  { id: 2, judul: 'Vue.js 3 for Beginners', penulis: 'Simone Cuomo', kategori: 'Teknologi', penerbit: 'Packt', tahun: 2024, tersedia: false, sinopsis: 'Belajar Vue dari dasar hingga mahir.' },
  { id: 3, judul: 'Learning Vue', penulis: 'Maya Shavin', kategori: 'Teknologi', penerbit: "O'Reilly", tahun: 2024, tersedia: true },
  { id: 4, judul: 'Bumi', penulis: 'Tere Liye', kategori: 'Fiksi', penerbit: 'Gramedia', tahun: 2014, tersedia: true },
  { id: 5, judul: 'Sapiens', penulis: 'Yuval Noah Harari', kategori: 'Sejarah', penerbit: 'Harper', tahun: 2011, tersedia: false },
  { id: 6, judul: 'Atomic Habits', penulis: 'James Clear', kategori: 'Bisnis', penerbit: 'Avery', tahun: 2018, tersedia: true },
  { id: 7, judul: 'The Pragmatic Programmer', penulis: 'David Thomas', kategori: 'Teknologi', penerbit: 'Addison-Wesley', tahun: 1999, tersedia: true },
  { id: 8, judul: 'Laskar Pelangi', penulis: 'Andrea Hirata', kategori: 'Fiksi', penerbit: 'Bentang', tahun: 2005, tersedia: false }
])

// --- COMPUTED (Tetap sama) ---
const daftarKategori = computed(() =>
  [...new Set(daftarBuku.value.map(b => b.kategori))].sort()
)

const bukuTerfilter = computed(() => {
  return daftarBuku.value.filter(buku => {
    const q = kataCari.value.toLowerCase()
    const cocokCari = !q || buku.judul.toLowerCase().includes(q) || buku.penulis.toLowerCase().includes(q)
    const cocokKategori = !filterKategori.value || buku.kategori === filterKategori.value
    const cocokStatus = filterStatus.value === 'semua' || (filterStatus.value === 'tersedia' && buku.tersedia) || (filterStatus.value === 'dipinjam' && !buku.tersedia)
    const cocokTahun = (!filterTahunDari.value || buku.tahun >= filterTahunDari.value) && (!filterTahunSampai.value || buku.tahun <= filterTahunSampai.value)
    return cocokCari && cocokKategori && cocokStatus && cocokTahun
  })
})

const infoHasil = computed(() => {
  const total = daftarBuku.value.length
  const terfilter = bukuTerfilter.value.length
  return (kataCari.value || filterKategori.value || filterStatus.value !== 'semua') 
    ? `Menampilkan ${terfilter} dari ${total} buku` 
    : `Total ${total} buku dalam koleksi`
})

// --- METHODS ---
onMounted(() => {
  isLoading.value = true
  setTimeout(() => isLoading.value = false, 800)
})

function resetFilter() {
  kataCari.value = ''
  filterKategori.value = ''
  filterStatus.value = 'semua'
  filterTahunDari.value = null
  filterTahunSampai.value = null
}

function lihatDetail(buku) {
  alert('Melihat detail: ' + buku.judul)
}

function pinjamBuku(id) {
  const buku = daftarBuku.value.find(b => b.id === id)
  if (buku && buku.tersedia) {
    buku.tersedia = false
    alert('Buku berhasil dipinjam!')
  }
}
</script>

<style scoped>
.katalog-page { max-width:1200px; margin:0 auto; padding:32px 24px; }
/* Style CSS manual Anda sebagian besar sudah digantikan oleh class Tailwind 
   atau sudah ditangani di dalam KartuBuku.vue */
</style>