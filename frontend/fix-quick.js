const fs = require('fs');
const path = require('path');

// Lista de arquivos para corrigir
const filesToFix = [
  'src/pages/Patients/PatientList.js',
  'src/pages/Documents/DocumentList.js',
  'src/pages/Notes/NoteList.js',
  'src/pages/Appointments/AppointmentList.js'
];

filesToFix.forEach(file => {
  try {
    const filePath = path.join(__dirname, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Corrigir padrão básico de layout
    if (content.includes('return (') && !content.includes('<Container maxWidth="lg">')) {
      content = content.replace(
        /return \(\s*\n\s*<Box/,
        'return (\n    <Container maxWidth="lg">\n      <Box'
      );
      
      // Encontrar último </Box> e adicionar </Container>
      const lines = content.split('\n');
      let lastBoxIndex = -1;
      let boxCount = 0;
      
      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].includes('</Box>')) {
          lastBoxIndex = i;
          break;
        }
      }
      
      if (lastBoxIndex !== -1) {
        lines.splice(lastBoxIndex + 1, 0, '    </Container>');
        content = lines.join('\n');
      }
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Corrigido: ${file}`);
    }
  } catch (error) {
    console.log(`Erro em ${file}:`, error.message);
  }
});

console.log('Correção concluída!');