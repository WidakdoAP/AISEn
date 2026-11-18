import type { SearchResult } from "../types/search";

export const mockAISummary = {
  title: "Ringkasan hasil penelitian",
  content:
    "Berdasarkan hasil pencarian, ditemukan sejumlah penelitian yang membahas topik ini dari berbagai perspektif. Penelitian yang relevan umumnya berfokus pada karakteristik wilayah, perkembangan sosial ekonomi, serta pengaruh faktor lingkungan terhadap masyarakat. Beberapa penelitian juga menggunakan pendekatan analisis statistik dan pemodelan untuk memahami permasalahan tersebut.",
  keywords: [
    "Analisis wilayah",
    "Sosial ekonomi",
    "Lingkungan",
    "Penelitian empiris",
  ],
};

export const mockSearchResults: SearchResult[] = [
  {
    peringkat: 1,
    skor: 0.9234,
    judul:
      "Analisis Pengaruh Digitalisasi terhadap Pertumbuhan Ekonomi dan Produktivitas UMKM di Indonesia",
    penulis: "Pratama, Andi; Wijayanti, Rina",
    deskripsi:
      "Penelitian ini bertujuan untuk menganalisis pengaruh digitalisasi terhadap pertumbuhan ekonomi dan produktivitas usaha mikro, kecil, dan menengah di Indonesia. Transformasi digital memberikan peluang bagi UMKM untuk memperluas pasar, meningkatkan efisiensi operasional, dan memperbaiki kualitas layanan. Penelitian menggunakan pendekatan kuantitatif dengan analisis regresi terhadap data UMKM di beberapa wilayah Indonesia.",
    url: "https://eprints.undip.ac.id/",
    date: "2024-08-15",
  },
  {
    peringkat: 2,
    skor: 0.8872,
    judul:
      "Strategi Pemberdayaan Ekonomi Masyarakat melalui Pengembangan Usaha Mikro Kecil dan Menengah",
    penulis: "Sari, Dewi; Nugroho, Budi",
    deskripsi:
      "Pemberdayaan ekonomi masyarakat merupakan salah satu strategi penting dalam mengurangi kesenjangan ekonomi. Penelitian ini membahas berbagai program pemberdayaan UMKM, hambatan dalam implementasi kebijakan, serta peran pemerintah daerah dalam meningkatkan kapasitas ekonomi masyarakat.",
    url: "https://eprints.undip.ac.id/",
    date: "2023-11-20",
  },
  {
    peringkat: 3,
    skor: 0.8519,
    judul:
      "Pengaruh Tingkat Pendidikan dan Pengangguran terhadap Kemiskinan di Provinsi Jawa Tengah",
    penulis: "Rahmawati, Nisa",
    deskripsi:
      "Kemiskinan merupakan permasalahan multidimensional yang dipengaruhi oleh berbagai faktor sosial dan ekonomi. Penelitian ini menganalisis hubungan antara tingkat pendidikan, tingkat pengangguran, dan angka kemiskinan di Provinsi Jawa Tengah menggunakan data sekunder dari Badan Pusat Statistik.",
    url: "https://eprints.undip.ac.id/",
    date: "2022-06-10",
  },
  {
    peringkat: 4,
    skor: 0.8245,
    judul:
      "Implementasi Smart City dalam Meningkatkan Kualitas Pelayanan Publik di Kota Semarang",
    penulis: "Wibowo, Aditya; Lestari, Hesti",
    deskripsi:
      "Konsep smart city menjadi salah satu pendekatan dalam meningkatkan kualitas pelayanan publik melalui pemanfaatan teknologi informasi. Penelitian ini mengevaluasi implementasi smart governance, infrastruktur digital, serta partisipasi masyarakat dalam pengembangan kota cerdas di Kota Semarang.",
    url: "https://eprints.undip.ac.id/",
    date: "2024-02-12",
  },
  {
    peringkat: 5,
    skor: 0.7913,
    judul:
      "Analisis Dampak Perubahan Iklim terhadap Ketahanan Pangan dan Kesejahteraan Petani",
    penulis: "Firmansyah, Rizky",
    deskripsi:
      "Perubahan iklim dapat memengaruhi produktivitas pertanian dan kondisi sosial ekonomi masyarakat pedesaan. Penelitian ini mengidentifikasi dampak perubahan pola curah hujan dan suhu terhadap hasil pertanian serta strategi adaptasi yang dilakukan oleh petani.",
    url: "https://eprints.undip.ac.id/",
    date: "2023-04-18",
  },
  {
    peringkat: 6,
    skor: 0.7638,
    judul:
      "Pengembangan Sistem Informasi Geografis untuk Pemetaan Daerah Rawan Bencana Banjir",
    penulis: "Kurniawan, Fajar; Putri, Amelia",
    deskripsi:
      "Penelitian ini mengembangkan sistem informasi geografis untuk membantu identifikasi dan pemetaan daerah rawan banjir. Data spasial, kondisi topografi, penggunaan lahan, dan intensitas curah hujan digunakan sebagai parameter dalam menentukan tingkat kerawanan wilayah.",
    url: "https://eprints.undip.ac.id/",
    date: "2021-09-25",
  },
  {
    peringkat: 7,
    skor: 0.7391,
    judul:
      "Pemanfaatan Machine Learning untuk Prediksi Konsumsi Energi Listrik pada Bangunan",
    penulis: "Saputra, Dimas",
    deskripsi:
      "Penelitian ini menerapkan algoritma machine learning untuk memprediksi kebutuhan konsumsi energi listrik pada bangunan. Model dikembangkan menggunakan data historis konsumsi listrik dan beberapa variabel lingkungan untuk mendukung pengelolaan energi yang lebih efisien.",
    url: "https://eprints.undip.ac.id/",
    date: "2024-05-30",
  },
  {
    peringkat: 8,
    skor: 0.7026,
    judul:
      "Evaluasi Kebijakan Transportasi Berkelanjutan dalam Mengurangi Kemacetan Perkotaan",
    penulis: "Hidayat, Muhammad; Anggraini, Sinta",
    deskripsi:
      "Transportasi berkelanjutan menjadi salah satu solusi untuk mengatasi permasalahan mobilitas perkotaan. Penelitian ini mengevaluasi efektivitas kebijakan transportasi umum, pengembangan jalur pedestrian, dan integrasi antarmoda dalam mengurangi kemacetan.",
    url: "https://eprints.undip.ac.id/",
    date: "2022-12-05",
  },
  {
    peringkat: 9,
    skor: 0.6812,
    judul:
      "Analisis Sentimen Masyarakat terhadap Kebijakan Pemerintah Menggunakan Natural Language Processing",
    penulis: "Maulana, Farhan",
    deskripsi:
      "Penelitian ini menggunakan pendekatan natural language processing untuk mengidentifikasi sentimen masyarakat terhadap kebijakan pemerintah berdasarkan data teks. Tahapan penelitian mencakup preprocessing, ekstraksi fitur, klasifikasi sentimen, dan evaluasi performa model.",
    url: "https://eprints.undip.ac.id/",
    date: "2023-07-14",
  },
  {
    peringkat: 10,
    skor: 0.6458,
    judul:
      "Pengaruh Kualitas Lingkungan terhadap Kesehatan dan Kesejahteraan Masyarakat Perkotaan",
    penulis: "Prasetyo, Arif",
    deskripsi:
      "Kualitas lingkungan perkotaan memiliki hubungan erat dengan kesehatan dan kesejahteraan masyarakat. Penelitian ini mengkaji hubungan antara kualitas udara, ketersediaan ruang terbuka hijau, sanitasi, dan kondisi kesehatan penduduk di kawasan perkotaan.",
    url: "https://eprints.undip.ac.id/",
    date: "2021-03-22",
  },
];
