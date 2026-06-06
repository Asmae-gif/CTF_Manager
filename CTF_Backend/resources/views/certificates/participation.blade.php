{{-- resources/views/certificates/participation.blade.php --}}
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        @page {
            margin: 0;
            size: A4 landscape;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: DejaVu Sans, sans-serif;
            background-color: #0a1220;
            color: #e2e8f0;
            width: 297mm;
            height: 210mm;
            overflow: hidden;
        }

        /* ── Grille background style pirate.cyber ── */
        .bg {
            position: absolute;
            inset: 0;
            background-color: #0a1220;
            background-image:
                linear-gradient(rgba(0,242,255,0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,242,255,0.04) 1px, transparent 1px);
            background-size: 32px 32px;
        }

        .container {
            position: relative;
            z-index: 1;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            padding: 28px 40px; /* Légèrement réduit pour éviter le débordement sur 2 pages */
            border: 2px solid rgba(255,183,3,0.25);
        }

        /* ── Coins dorés ── */
        .corner {
            position: absolute;
            width: 24px;
            height: 24px;
            border-color: #ffb703;
            border-style: solid;
        }
        .corner-tl { top: 12px; left: 12px; border-width: 2px 0 0 2px; }
        .corner-tr { top: 12px; right: 12px; border-width: 2px 2px 0 0; }
        .corner-bl { bottom: 12px; left: 12px; border-width: 0 0 2px 2px; }
        .corner-br { bottom: 12px; right: 12px; border-width: 0 2px 2px 0; }

        /* ── Header ── */
        .header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 20px;
        }

        .logo-block {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .logo-icon {
            width: 36px;
            height: 36px;
            background-color: #ffb703;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            line-height: 1;
            text-align: center;
            padding-top: 4px;
        }

        .logo-text {
            font-size: 18px;
            font-weight: bold;
            letter-spacing: 2px;
            color: #ffffff;
        }

        .logo-text span {
            color: #00f2ff;
        }

        .eyebrow {
            font-size: 9px;
            font-family: 'Courier New', monospace;
            color: #00f2ff;
            letter-spacing: 4px;
            text-transform: uppercase;
            text-align: right;
        }

        /* ── Titre central ── */
        .title-block {
            text-align: center;
            margin-bottom: 16px;
        }

        .title-label {
            font-size: 9px;
            font-family: 'Courier New', monospace;
            color: #00f2ff;
            letter-spacing: 5px;
            text-transform: uppercase;
            margin-bottom: 6px;
        }

        .title-main {
            font-size: 34px;
            font-style: italic;
            color: #ffb703;
            letter-spacing: 1px;
            line-height: 1.1;
        }

        .title-sub {
            font-size: 10px;
            font-family: 'Courier New', monospace;
            color: rgba(255,255,255,0.35);
            letter-spacing: 3px;
            text-transform: uppercase;
            margin-top: 6px;
        }

        /* ── Séparateur ── */
        .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, rgba(255,183,3,0.4), transparent);
            margin: 10px 0;
        }

        /* ── Infos principales ── */
        .info-grid {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 14px;
        }

        .info-card {
            flex: 1;
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 8px;
            padding: 12px 16px;
        }

        .info-card.highlight {
            border-color: rgba(0,242,255,0.2);
            background: rgba(0,242,255,0.03);
        }

        .info-label {
            font-size: 8px;
            font-family: 'Courier New', monospace;
            color: #00f2ff;
            letter-spacing: 3px;
            text-transform: uppercase;
            margin-bottom: 5px;
        }

        .info-value {
            font-size: 15px;
            font-weight: bold;
            color: #ffffff;
            letter-spacing: 0.5px;
        }

        .info-value.gold {
            color: #ffb703;
            font-style: italic;
            font-size: 17px;
        }

        /* ── Prize ── */
        .prize-block {
            background: rgba(255,183,3,0.06);
            border: 1px solid rgba(255,183,3,0.25);
            border-left: 3px solid #ffb703;
            border-radius: 0 6px 6px 0;
            padding: 10px 16px;
            margin-bottom: 14px;
            font-size: 11px;
            color: #ffb703;
            font-family: 'Courier New', monospace;
            letter-spacing: 1px;
        }

        /* ── Footer signatures ── */
        .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: auto;
            padding-top: 10px;
            border-top: 1px solid rgba(255,255,255,0.06);
        }

        .sign-block {
            width: 42%;
        }

        .sign-line {
            border-top: 1px solid rgba(255,255,255,0.2);
            padding-top: 8px;
            font-size: 9px;
            font-family: 'Courier New', monospace;
            color: rgba(255,255,255,0.4);
            letter-spacing: 1px;
        }

        .sign-name {
            font-size: 11px;
            color: rgba(255,255,255,0.7);
            margin-top: 2px;
        }

        .sign-block.right {
            text-align: right;
        }

        /* ── Badge placement ── */
        .placement-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 9px;
            font-family: 'Courier New', monospace;
            letter-spacing: 2px;
            text-transform: uppercase;
        }

        .placement-1 { background: rgba(255,183,3,0.15); border: 1px solid rgba(255,183,3,0.4); color: #ffb703; }
        .placement-2 { background: rgba(209,213,219,0.1); border: 1px solid rgba(209,213,219,0.3); color: #d1d5db; }
        .placement-3 { background: rgba(251,146,60,0.1); border: 1px solid rgba(251,146,60,0.3); color: #fb923c; }

        /* ── Seal central ── */
        .seal {
            text-align: center;
            margin: 0 20px;
        }

        .seal-circle {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: 2px solid rgba(255,183,3,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 4px;
            font-size: 20px;
        }

        .seal-text {
            font-size: 7px;
            font-family: 'Courier New', monospace;
            color: rgba(255,183,3,0.5);
            letter-spacing: 2px;
            text-transform: uppercase;
        }

        .id-line {
            font-size: 7px;
            font-family: 'Courier New', monospace;
            color: rgba(255,255,255,0.2);
            letter-spacing: 1px;
            text-align: right;
        }
    </style>
</head>
<body>

<div class="bg"></div>

<div class="container">

    {{-- Coins décoratifs --}}
    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>

    {{-- Header --}}
    <div class="header">
        <div class="logo-block">
            <div class="logo-icon">⚓</div>
            <div class="logo-text">PIRATE<span>.CYBER</span></div>
        </div>
        <div class="eyebrow">// official certificate</div>
    </div>

    {{-- Titre --}}
    <div class="title-block">
        <div class="title-label">// CTF — reconnaissance officielle de participation</div>
        <div class="title-main">Certificat de Participation</div>
        <div class="title-sub">Capture The Flag · {{ date('Y') }}</div>
    </div>

    <div class="divider"></div>

    {{-- Infos principales --}}
    <div class="info-grid">

        <div class="info-card highlight" style="flex: 1.4;">
            <div class="info-label">Pirate</div>
            <div class="info-value gold">{{ $participant_name }}</div>
            @if(!empty($team_name))
            <div style="margin-top: 4px; font-size: 9px; font-family: 'DejaVu Sans', 'Courier New', monospace; color: rgba(255,255,255,0.4); letter-spacing: 2px; text-transform: uppercase;">
                Équipe : {{ $team_name }}
            </div>
            @endif
        </div>

        <div class="info-card" style="flex: 1.6;">
            <div class="info-label">Compétition</div>
            <div class="info-value">{{ $competition_title }}</div>
        </div>

        <div class="info-card">
            <div class="info-label">Date</div>
            <div class="info-value">{{ $date }}</div>
        </div>

        @if(!empty($team_rank) && $team_rank <= 3)
        <div class="info-card" style="text-align: center;">
            <div class="info-label">Classement</div>
            <div style="margin-top: 4px;">
                <span class="placement-badge placement-{{ $team_rank }}">
                    @if($team_rank === 1) 🥇 1re place
                    @elseif($team_rank === 2) 🥈 2e place
                    @else 🥉 3e place
                    @endif
                </span>
            </div>
        </div>
        @endif

    </div>

    {{-- Prix --}}
    @if(!empty($prize_line))
    <div class="prize-block">⚡ {{ $prize_line }}</div>
    @endif

    {{-- Footer --}}
    <div class="footer">

        <div class="sign-block">
            <div class="sign-line">
                SIGNATURE / ORGANISATEUR
                <div class="sign-name">{{ $organizer }}</div>
            </div>
        </div>

        <div class="seal">
            <div class="seal-circle">🏴</div>
            <div class="seal-text">Pirate Cyber CTF</div>
        </div>

        <div class="sign-block right">
            <div class="sign-line">
                VALIDÉ PAR LA PLATEFORME
                <div class="sign-name">pirate.cyber</div>
            </div>
        </div>

    </div>

    {{-- ID certificat discret --}}
    <div class="id-line" style="margin-top: 6px;">
        // cert-id : {{ strtoupper(substr(md5($participant_name . $competition_title . $date), 0, 16)) }}
    </div>

</div>

</body>
</html>
