

Product Requirements Document (PRD)

Serivio

Tagline: Track every story, never lose your place.


---

1. Overview

Product Name

Serivio

Vision

Serivio adalah aplikasi web yang membantu pengguna melacak semua series yang mereka ikuti dalam satu tempat, tanpa memandang jenis medianya.

Alih-alih mengingat sendiri sudah sampai episode atau chapter berapa di berbagai platform, pengguna cukup membuka Serivio untuk mengetahui progress seluruh koleksi mereka.

Serivio bukan platform streaming maupun membaca, melainkan personal media tracker.


---

2. Problem Statement

Saat ini seseorang dapat mengikuti puluhan hingga ratusan series dari berbagai platform, seperti:

Netflix

Disney+

Crunchyroll

YouTube Series

Manga

Manhwa

Manhua

Comic

Novel

Book


Masalah yang sering terjadi:

Lupa episode terakhir yang ditonton.

Lupa chapter terakhir yang dibaca.

Lupa judul series.

Lupa apakah series sudah selesai.

Lupa kapan terakhir dibuka.

Progress tersebar di banyak platform.


Serivio menjadi satu tempat untuk menyimpan seluruh progress tersebut.


---

3. Goals

Pengguna dapat:

Menyimpan seluruh series yang diikuti.

Mengetahui progress setiap series.

Melanjutkan dari progress terakhir.

Mengelompokkan series berdasarkan status.

Mencari series dengan cepat.

Tidak kehilangan progress lagi.



---

4. Target User

Anime watcher

Movie enthusiast

TV Series enthusiast

Manga reader

Manhwa reader

Comic reader

Novel reader

Book reader



---

5. Supported Media

Anime

TV Series

Movie

Manga

Manhwa

Manhua

Comic

Light Novel

Web Novel

Novel

Book



---

6. MVP Features

Authentication

Username

Password

Session-based authentication



---

Dashboard

Menampilkan:

Continue Watching / Reading

Solo Leveling
Chapter 233

One Piece
Chapter 1158

Frieren
Episode 18

Recently Updated

One Piece
Last updated today

Chainsaw Man
Yesterday

Statistics

Watching : 12

Reading : 27

Completed : 18

On Hold : 4


---

7. Add Series

Pengguna dapat menambahkan series secara manual.

Field:

Title

Alternative Title (optional)

Cover Image

Media Type

Status

Current Progress

Total Progress (optional)

Personal Rating

Notes

Tags



---

Media Type

Anime

TV Series

Movie

Manga

Manhwa

Manhua

Comic

Light Novel

Web Novel

Novel

Book



---

Status

Watching

Reading

Completed

On Hold

Dropped

Plan to Watch

Plan to Read



---

8. Progress Tracking

Anime / TV Series

Current Episode

Total Episodes

Season

Last Watched



---

Movie

Watched

Personal Rating



---

Manga / Manhwa / Comic

Current Chapter

Current Volume

Last Read



---

Novel / Book

Current Chapter (optional)

Current Page (optional)

Current Volume (optional)

Last Read



---

9. Continue Button

Pada halaman detail tersedia tombol:

Continue

Ketika ditekan, progress otomatis bertambah satu.

Contoh:

Episode 8 → Episode 9

atau

Chapter 1158 → Chapter 1159


---

10. Collections

Pengguna dapat membuat koleksi sendiri.

Contoh:

Favorites

One Piece

Breaking Bad

Attack on Titan

Weekend

Frieren

TBATE

Comedy

Grand Blue


---

11. Search

Pencarian berdasarkan:

Title

Alternative Title

Tags

Media Type

Status



---

12. Filtering

Filter

Media

Anime

Movie

TV Series

Manga

Manhwa

Comic

Novel

Book


Status

Watching

Reading

Completed

On Hold

Dropped

Plan to Watch

Plan to Read


Sort By

Recently Updated

Last Opened

Rating

Alphabetical

Progress



---

13. Detail Page

Informasi Series

Cover

Title

Alternative Title

Media Type

Genres

Description

Author

Studio / Publisher

Release Year


Progress

Episode 18 / 24

atau

Chapter 213 / ?

History

Yesterday

Episode 18

2 days ago

Episode 17


---

14. Statistics

Menampilkan statistik berdasarkan media dan status.

Contoh:

Anime

Watching : 18

Completed : 42

Movie

Completed : 214

Manga

Reading : 34

Completed : 11


Tecnical stuff
Untuk stacknya gunakan sveltekit dwngan runtime bun orm drizzle , auth dengan better auth 
Validation
Valibot
Form Handling
Superforms
Search Engine
Elasticsearch


INGAT UNTUK BUAT GIT DAN COMMIT TIAP ADA PERUBAHANYANG BERMAKNA JANGAN BULK COMMIT DAN JANGAN COMMIT MSGNYA MENGANDUNG CO AUTHORED CLAUDE


dan untuk infranya setup pakai docker compose yang isinya infra seperti postgres dan minio dan elastic search dan redis kalau butuh


Kemudian buat e2e testing juga dengan playwright dan unit test 

Ikuti design.md dan file file lainnya untuk design
 
buatkan sampai ada landing pagenya juga
