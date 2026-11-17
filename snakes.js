const gameBoard = document.querySelector("#gameBoard"); // Ambil elemen canvas board game.
const ctx = gameBoard.getContext("2d"); // Ambil konteks 2D untuk menggambar.
const scoreText = document.querySelector("#scoreText"); // Ambil elemen teks skor.
const resetBtn = document.querySelector("#resetBtn"); // Ambil tombol reset.
const slowBtn = document.querySelector("#slowBtn"); // Ambil tombol perlambat.
const speedBtn = document.querySelector("#speedBtn"); // Ambil tombol percepat.
const gameWidth = gameBoard.width; // Simpan lebar board.
const gameHeight = gameBoard.height; // Simpan tinggi board.
const boardBackground = "white"; // Warna background board.
const snakeColor = "lightgreen"; // Warna isi badan ular.
const snakeBorder = "black"; // Warna garis tepi badan ular.
const foodColor = "red"; // Warna makanan.
const unitSize = 25; // Ukuran 1 kotak grid.
const minTickDelay = 35; // Delay minimum agar kecepatan tidak berlebihan.
const maxTickDelay = 220; // Delay maksimum agar ular tidak terlalu lambat.
const tickStep = 15; // Besar perubahan delay saat percepat/perlambat.
let running = false; // Status game berjalan atau tidak.
let xVelocity = unitSize; // Kecepatan awal arah X (bergerak ke kanan).
let yVelocity = 0; // Kecepatan awal arah Y.
let foodX; // Posisi X makanan.
let foodY; // Posisi Y makanan.
let score = 0; // Skor awal.
let tickDelay = 75; // Delay awal tiap tick.
let directionQueue = []; // Antrian belokan dari keyboard, diproses satu per langkah.
let tickTimer = null; // ID setTimeout loop game, dipakai agar reset tidak membuat loop ganda.
let snake = [ // Data segmen ular.
    {x: unitSize, y: 0}, // Kepala ular awal.
    {x: 0, y: 0} // Ekor ular awal.
]; // Tutup array ular.

window.addEventListener("keydown", changeDirection); // Dengarkan keyboard untuk kontrol game.
resetBtn.addEventListener("click", resetGame); // Klik tombol reset untuk ulang game.
slowBtn.addEventListener("click", slowDownSnake); // Klik tombol perlambat.
speedBtn.addEventListener("click", speedUpSnake); // Klik tombol percepat.

gameStart(); // Mulai game saat file dimuat.

function gameStart() { // Fungsi untuk inisialisasi awal game.
    running = true; // Tandai game sedang berjalan.
    scoreText.textContent = score; // Tampilkan skor saat ini.
    createFood(); // Buat posisi makanan baru.
    drawFood(); // Gambar makanan pertama.
    nextTick(); // Jalankan loop game.
} // Akhir fungsi gameStart.

function nextTick() { // Fungsi loop utama game.
    if (running) { // Cek apakah game masih aktif.
        tickTimer = setTimeout(() => { // Jalankan langkah game tiap interval.
            clearBoard(); // Bersihkan board sebelum redraw.
            drawFood(); // Gambar makanan.
            moveSnake(); // Gerakkan ular.
            drawSnake(); // Gambar ular.
            checkGameOver(); // Cek kondisi kalah.
            nextTick(); // Ulangi loop.
        }, tickDelay); // Gunakan delay sesuai kecepatan sekarang.
    } else { // Jika game tidak berjalan.
        displayGameOver(); // Tampilkan teks game over.
    } // Akhir if running.
} // Akhir fungsi nextTick.

function clearBoard() { // Bersihkan area canvas.
    ctx.fillStyle = boardBackground; // Set warna latar board.
    ctx.fillRect(0, 0, gameWidth, gameHeight); // Isi seluruh canvas.
} // Akhir fungsi clearBoard.

function createFood() { // Buat koordinat makanan baru.
    function randomFood(min, max) { // Fungsi acak posisi per grid.
        const randNum = Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize; // Acak lalu snap ke grid.
        return randNum; // Kembalikan angka acak.
    } // Akhir fungsi randomFood.

    do { // Ulangi sampai makanan tidak muncul di atas badan ular.
        foodX = randomFood(0, gameWidth - unitSize); // Tetapkan posisi X makanan.
        foodY = randomFood(0, gameHeight - unitSize); // Tetapkan posisi Y makanan.
    } while (snake.some((part) => part.x === foodX && part.y === foodY)); // Cek tabrakan dengan badan ular.
} // Akhir fungsi createFood.

function drawFood() { // Gambar makanan di board.
    ctx.fillStyle = foodColor; // Set warna makanan.
    ctx.fillRect(foodX, foodY, unitSize, unitSize); // Gambar kotak makanan.
} // Akhir fungsi drawFood.

function moveSnake() { // Logika pergerakan ular.
    if (directionQueue.length > 0) { // Ambil satu belokan dari antrian per langkah.
        const next = directionQueue.shift(); // Belokan berikutnya.
        xVelocity = next.x; // Terapkan arah X.
        yVelocity = next.y; // Terapkan arah Y.
    } // Akhir ambil antrian.
    const head = {x: snake[0].x + xVelocity, y: snake[0].y + yVelocity}; // Hitung posisi kepala baru.

    snake.unshift(head); // Tambahkan kepala baru di depan array.

    if (snake[0].x === foodX && snake[0].y === foodY) { // Jika kepala menyentuh makanan.
        score += 1; // Tambah skor.
        scoreText.textContent = score; // Update teks skor.
        createFood(); // Buat makanan baru.
    } else { // Jika tidak makan.
        snake.pop(); // Buang ekor agar panjang tetap.
    } // Akhir if makan.
} // Akhir fungsi moveSnake.

function drawSnake() { // Gambar seluruh segmen ular.
    ctx.fillStyle = snakeColor; // Set warna isi segmen.
    ctx.strokeStyle = snakeBorder; // Set warna garis tepi segmen.
    snake.forEach((snakePart) => { // Loop tiap segmen ular.
        ctx.fillRect(snakePart.x, snakePart.y, unitSize, unitSize); // Gambar isi segmen.
        ctx.strokeRect(snakePart.x, snakePart.y, unitSize, unitSize); // Gambar tepi segmen.
    }); // Akhir loop forEach.
} // Akhir fungsi drawSnake.

function changeDirection(event) { // Handler keyboard.
    const keyPressed = event.code; // Ambil kode tombol yang ditekan.
    const last = directionQueue.length > 0 ? directionQueue[directionQueue.length - 1] : {x: xVelocity, y: yVelocity}; // Arah terakhir yang akan dipakai ular.
    const goingUp = (last.y === -unitSize); // Status ular (setelah antrian) ke atas.
    const goingDown = (last.y === unitSize); // Status ular (setelah antrian) ke bawah.
    const goingRight = (last.x === unitSize); // Status ular (setelah antrian) ke kanan.
    const goingLeft = (last.x === -unitSize); // Status ular (setelah antrian) ke kiri.

    if (keyPressed === "Space") { // Jika tombol spasi ditekan.
        event.preventDefault(); // Cegah scroll halaman.
        resetGame(); // Ulang game.
        return; // Hentikan proses tombol lain.
    } // Akhir if Space.

    if (keyPressed === "KeyA") { // Jika tombol A ditekan.
        slowDownSnake(); // Perlambat gerak ular.
        return; // Hentikan proses tombol lain.
    } // Akhir if KeyA.

    if (keyPressed === "KeyD") { // Jika tombol D ditekan.
        speedUpSnake(); // Percepat gerak ular.
        return; // Hentikan proses tombol lain.
    } // Akhir if KeyD.

    let next = null; // Arah baru yang diminta.
    if (keyPressed === "ArrowLeft" && !goingRight && !goingLeft) next = {x: -unitSize, y: 0}; // Kiri, tidak boleh berbalik dari kanan.
    if (keyPressed === "ArrowUp" && !goingDown && !goingUp) next = {x: 0, y: -unitSize}; // Atas, tidak boleh berbalik dari bawah.
    if (keyPressed === "ArrowRight" && !goingLeft && !goingRight) next = {x: unitSize, y: 0}; // Kanan, tidak boleh berbalik dari kiri.
    if (keyPressed === "ArrowDown" && !goingUp && !goingDown) next = {x: 0, y: unitSize}; // Bawah, tidak boleh berbalik dari atas.

    if (keyPressed.startsWith("Arrow")) event.preventDefault(); // Cegah scroll halaman.
    if (next && directionQueue.length < 2) { // Batasi antrian agar kontrol tetap responsif.
        directionQueue.push(next); // Simpan belokan untuk langkah berikutnya.
    } // Akhir simpan belokan.
} // Akhir fungsi changeDirection.

function checkGameOver() { // Cek semua kondisi game over.
    switch (true) { // Gunakan switch kondisi untuk boundary.
        case (snake[0].x < 0): // Kepala keluar sisi kiri.
            running = false; // Hentikan game.
            break; // Selesai kasus kiri.
        case (snake[0].x >= gameWidth): // Kepala keluar sisi kanan.
            running = false; // Hentikan game.
            break; // Selesai kasus kanan.
        case (snake[0].y < 0): // Kepala keluar sisi atas.
            running = false; // Hentikan game.
            break; // Selesai kasus atas.
        case (snake[0].y >= gameHeight): // Kepala keluar sisi bawah.
            running = false; // Hentikan game.
            break; // Selesai kasus bawah.
    } // Akhir switch boundary.

    for (let i = 1; i < snake.length; i += 1) { // Cek tabrakan kepala dengan badan sendiri.
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) { // Jika posisi segmen sama dengan kepala.
            running = false; // Hentikan game karena tabrakan diri.
        } // Akhir if tabrakan diri.
    } // Akhir loop tabrakan diri.
} // Akhir fungsi checkGameOver.

function displayGameOver() { // Tampilkan teks kalah di tengah board.
    ctx.font = "50px 'Permanent Marker', cursive"; // Font sama dengan UI (MV Boli hanya ada di Windows).
    ctx.fillStyle = "black"; // Set warna teks.
    ctx.textAlign = "center"; // Set alignment horizontal tengah.
    ctx.fillText("GAME OVER!", gameWidth / 2, gameHeight / 2); // Gambar teks game over di tengah.
    running = false; // Pastikan status game berhenti.
} // Akhir fungsi displayGameOver.

function speedUpSnake() { // Fungsi untuk mempercepat ular.
    tickDelay = Math.max(minTickDelay, tickDelay - tickStep); // Kurangi delay tapi jangan lewat batas minimum.
} // Akhir fungsi speedUpSnake.

function slowDownSnake() { // Fungsi untuk memperlambat ular.
    tickDelay = Math.min(maxTickDelay, tickDelay + tickStep); // Tambah delay tapi jangan lewat batas maksimum.
} // Akhir fungsi slowDownSnake.

function resetGame() { // Kembalikan game ke kondisi awal.
    clearTimeout(tickTimer);
    directionQueue = []; // Kosongkan antrian belokan. // Hentikan loop lama agar tidak berjalan dobel dengan loop baru.
    score = 0; // Reset skor.
    xVelocity = unitSize; // Arah awal ke kanan.
    yVelocity = 0; // Nolkan arah Y.
    tickDelay = 75; // Kembalikan delay default.
    snake = [ // Reset data ular.
        {x: unitSize, y: 0}, // Segmen kepala awal.
        {x: 0, y: 0} // Segmen ekor awal.
    ]; // Akhir array reset ular.
    gameStart(); // Mulai ulang game.
} // Akhir fungsi resetGame.
