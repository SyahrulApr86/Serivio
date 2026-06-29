<script lang="ts">
	const posters = [
		{ title: 'Blue Lock',            ep: 'Ep. 24',  src: '/posters/Blue%20Lock%20-%20Visual.jpeg',                          bg: 'linear-gradient(160deg,#0a1a40,#1e3a80,#2563eb)' },
		{ title: 'My Hero Academia',     ep: 'Ep. 138', src: '/posters/Boku%20no%20Hero%20Academia,%20season%201.jpeg',       bg: 'linear-gradient(160deg,#1a0a00,#7c2d12,#f97316)' },
		{ title: 'Dark',                 ep: 'Ep. 26',  src: '/posters/Dark%20Series%20Poster.jpeg',                            bg: 'linear-gradient(160deg,#0a0a14,#1a1a2e,#2d2d44)' },
		{ title: 'Dark',                 ep: 'Ep. 26',  src: '/posters/Dark%20Wallpaper.jpeg',                                  bg: 'linear-gradient(160deg,#0d0d1a,#1a1a30,#252540)' },
		{ title: 'Tokyo Ghoul',          ep: 'Ep. 12',  src: '/posters/Tokyo%20Ghoul.jpeg',                                     bg: 'linear-gradient(160deg,#1a0000,#5c0000,#a00000)' },
		{ title: 'Warface',              ep: '',        src: '/posters/Warface%20Wallpaper.jpeg',                               bg: 'linear-gradient(160deg,#0a1020,#1c2840,#2a3a5a)' },
		{ title: '',                     ep: '',        src: '/posters/_.jpeg',                                                  bg: 'linear-gradient(160deg,#1a0a2e,#5b21b6,#7c3aed)' },
		{ title: '',                     ep: '',        src: '/posters/auad.jpeg',                                               bg: 'linear-gradient(160deg,#0c1a0c,#14532d,#16a34a)' },
		{ title: 'Magic & Muscles',      ep: '',        src: '/posters/%D0%BA%D1%82%D0%BE%20%D0%BB%D1%8E%D0%B1%D0%B8%D1%82%20%D0%BC%D0%B0%D0%B3%D0%B8%D1%8F%20%D0%B8%20%D0%BC%D1%83%D1%81%D0%BA%D1%83%D0%BB%D1%8B_.jpeg', bg: 'linear-gradient(160deg,#2d0a4e,#6b21a8,#a855f7)' },
		// fill to 12 with repeats
		{ title: '',                     ep: '',        src: '/posters/x2913bn7holf1.jpeg',                                     bg: 'linear-gradient(160deg,#1a0000,#5c0000,#a00000)' },
		{ title: '',                     ep: '',        src: '/posters/1002907720-photo-u-1148931436.jpeg',                      bg: 'linear-gradient(160deg,#0d1520,#1a2a40,#243550)' },
		{ title: 'My Hero Academia',     ep: 'Ep. 138', src: '/posters/Boku%20no%20Hero%20Academia,%20season%201.jpeg',       bg: 'linear-gradient(160deg,#1a0a00,#7c2d12,#f97316)' },
	];

	const cols = [posters.slice(0,3), posters.slice(3,6), posters.slice(6,9), posters.slice(9,12)];
	const offsets = ['mt-0', '-mt-10', 'mt-6', '-mt-16'];
</script>

<div class="collage" aria-hidden="true">
	<div class="grid">
		{#each cols as col, ci}
			<div class="col {offsets[ci]}">
				{#each col as p}
					<div class="card" style="background:{p.bg}">
						<img src={p.src} alt={p.title} class="cover" loading="lazy" />
						{#if p.title}
							<div class="foot">
								<span class="name">{p.title}</span>
								{#if p.ep}<span class="ep">{p.ep}</span>{/if}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/each}
	</div>

	<div class="edge-fade"></div>
	<div class="blob blob-pink"></div>
	<div class="blob blob-blue"></div>
	<div class="blob blob-gold"></div>
	<div class="center-wash"></div>
</div>

<style>
	.collage {
		position: absolute;
		inset: -60px -80px;
		pointer-events: none;
	}

	.grid {
		position: absolute;
		inset: 0;
		display: flex;
		gap: 16px;
		padding: 0 24px;
		transform: rotate(-8deg) scale(1.2);
		transform-origin: center 45%;
	}

	.col {
		display: flex;
		flex-direction: column;
		gap: 16px;
		flex: 1;
	}

	.card {
		position: relative;
		border-radius: 14px;
		overflow: hidden;
		aspect-ratio: 2/3;
		flex-shrink: 0;
	}

	.cover {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.foot {
		position: absolute;
		bottom: 0; left: 0; right: 0;
		padding: 28px 10px 10px;
		background: linear-gradient(to top, rgba(0,0,0,0.75), transparent);
		display: flex;
		flex-direction: column;
		gap: 2px;
		z-index: 1;
	}

	.name {
		color: #fff;
		font-size: 11px;
		font-weight: 700;
		font-family: sans-serif;
		line-height: 1.2;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.ep {
		color: rgba(255,255,255,0.6);
		font-size: 9px;
		font-family: sans-serif;
	}

	.edge-fade {
		position: absolute;
		inset: 0;
		background:
			linear-gradient(to right,  #fff 0%, transparent 18%, transparent 82%, #fff 100%),
			linear-gradient(to bottom, #fff 0%, transparent 15%, transparent 80%, #fff 100%);
	}

	.blob {
		position: absolute;
		border-radius: 50%;
		filter: blur(90px);
	}
	.blob-pink  { width: 500px; height: 500px; left: 25%;  top: -100px;   background: #f75cc3; opacity: 0.18; }
	.blob-blue  { width: 400px; height: 400px; right: 10%; top: 5%;       background: #2969ff; opacity: 0.16; }
	.blob-gold  { width: 350px; height: 350px; left: 10%;  bottom: -40px; background: #ffd363; opacity: 0.18; }

	.center-wash {
		position: absolute;
		inset: 0;
		background: radial-gradient(
			ellipse 70% 60% at 50% 38%,
			rgba(255,255,255,0.96) 0%,
			rgba(255,255,255,0.88) 35%,
			rgba(255,255,255,0.60) 58%,
			rgba(255,255,255,0.0) 80%
		);
	}
</style>
