<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>ChemEdit Molecule Viewer</title>
    <!-- Pico.css makes basic HTML look beautiful automatically -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
    <!-- SmilesDrawer for rendering -->
    <script src="https://unpkg.com/smiles-drawer@2.1.8/dist/smiles-drawer.min.js"></script>
    <style>
        body { padding-top: 50px; }
        .molecule-container { display: flex; justify-content: center; background: white; padding: 20px; border-radius: 10px; border: 1px solid #ddd; margin-bottom: 30px; }
        .promo-box { text-align: center; background: #f8f9fa; padding: 30px; border-radius: 10px; }
    </style>
</head>
<body>
    <main class="container">
        <h2 style="text-align: center;">Shared Chemical Structure</h2>
        
        <div class="molecule-container">
            <canvas id="molecule-canvas" width="500" height="500"></canvas>
            <div id="error-msg" style="display:none; color: red;">Invalid SMILES string.</div>
        </div>

        <article class="promo-box">
            <h4>Generated via ChemEdit for Obsidian</h4>
            <p>This molecule was shared by a user of <strong>ChemEdit</strong>, an advanced electronic lab notebook plugin for Obsidian.</p>
            <hr>
            <p>Developed by <strong>Ruzal Sitdikov</strong>. I am a developer/chemist currently open to new work opportunities!</p>
            <div class="grid">
                <!-- Replace these links with your actual links later -->
                <a href="https://linkedin.com/in/YOUR_LINKEDIN" role="button" target="_blank">Connect on LinkedIn</a>
                <a href="/" role="button" class="secondary">View my Portfolio & CV</a>
                <a href="https://github.com/katananananna/obsidian-chemedit" role="button" class="contrast" target="_blank">Get ChemEdit</a>
            </div>
        </article>
    </main>

    <script>
        document.addEventListener("DOMContentLoaded", function() {
            const hash = window.location.hash;
            if (hash.startsWith('#smi=')) {
                const smiles = decodeURIComponent(hash.substring(5));
                const options = { width: 500, height: 500, compactDrawing: false };
                const smilesDrawer = new SmilesDrawer.Drawer(options);
                
                SmilesDrawer.parse(smiles, function(tree) {
                    smilesDrawer.draw(tree, 'molecule-canvas', 'light', false);
                }, function(err) {
                    document.getElementById('molecule-canvas').style.display = 'none';
                    document.getElementById('error-msg').style.display = 'block';
                    console.error(err);
                });
            } else {
                document.getElementById('molecule-canvas').style.display = 'none';
                document.getElementById('error-msg').innerText = "No molecule data provided in the link.";
                document.getElementById('error-msg').style.display = 'block';
            }
        });
    </script>
</body>
</html>
