import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // ── STATE ────────────────────────────────────────────────
  // Mengambil data dari localStorage agar sesi tetap terjaga saat refresh
  const token = ref(localStorage.getItem('siperpus_token') || null)
  const user = ref(JSON.parse(localStorage.getItem('siperpus_user') || 'null'))

  // ── GETTERS (COMPUTED) ───────────────────────────────────
  const isLoggedIn = computed(() => !!token.value)
  const isPustakawan = computed(() => user.value?.role === 'pustakawan')
  const isAnggota = computed(() => user.value?.role === 'anggota')
  const namaUser = computed(() => user.value?.nama || 'Tamu')
  
  const inisialUser = computed(() => {
    if (!user.value?.nama) return '?'
    return user.value.nama
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  })

  // ── ACTIONS ──────────────────────────────────────────────
  
  /**
   * Simulasi login user (Akan dihubungkan ke Express.js pada Bab 5)
   */
  async function login(email, password) {
    const users = [
      { 
        id: 1, 
        nama: 'Trafalgar Law', 
        email: 'admin@siperpus.id', 
        password: 'admin123', 
        role: 'pustakawan' 
      },
      { 
        id: 2, 
        nama: 'Siti Anggota', 
        email: 'siti@gmail.com', 
        password: 'anggota123', 
        role: 'anggota' 
      },
      { 
        id: 3, 
        nama: 'Trafalgar Law', 
        email: 'law@gmail.com', 
        password: 'admin123', 
        role: 'pustakawan' 
      },
    ]

    const found = users.find(u => u.email === email && u.password === password)

    if (!found) {
      throw new Error('Email atau password salah')
    }

    // Persiapan data sesi
    const fakeToken = `token-${found.id}-${Date.now()}`
    const userData = { 
      id: found.id, 
      nama: found.nama, 
      email: found.email, 
      role: found.role 
    }

    // Update State
    token.value = fakeToken
    user.value = userData

    // Simpan ke localStorage (Persist)
    localStorage.setItem('siperpus_token', fakeToken)
    localStorage.setItem('siperpus_user', JSON.stringify(userData))

    return userData
  }

  /**
   * Menghapus sesi dan data lokal
   */
  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('siperpus_token')
    localStorage.removeItem('siperpus_user')
  }

  return {
    // State
    token, 
    user,
    // Getters
    isLoggedIn, 
    isPustakawan, 
    isAnggota, 
    namaUser, 
    inisialUser,
    // Actions
    login, 
    logout,
  }
})