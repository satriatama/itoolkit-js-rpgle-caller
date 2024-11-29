const express = require('express');
const { Connection, ProgramCall } = require('itoolkit');
const { XMLParser } = require('fast-xml-parser');

const app = express();
const port = 3000; // Bisa diganti sesuai kebutuhan

// Middleware untuk parsing JSON
app.use(express.json());

// Membuat koneksi ke AS400
const connection = new Connection({
    transport: 'ssh',
    transportOptions: {
      host: 'pub400.com',
      port: 2222,
      username: '',
      password: '',
    },
});

// Endpoint untuk memanggil JDWLMAIN program
app.get('/call-jdwlmain', (req, res) => {
  const receiver = {
    name: 'JDWLMAIN',
    type: 'ds', 
    fields: [
      { name: 'inim', type: '10A', value: req.body.inim || 'MIP0000004' }, // Default value jika tidak diberikan
      { name: 'oname', type: '10A', value: req.body.oname || '' },
      { name: 'ofree', type: '800A', value: req.body.ofree || '' },
    ],
  };

  const command = new ProgramCall('JDWLMAIN', { lib: '' });
  command.addParam(receiver);

  connection.add(command);

  // Menjalankan command
  connection.run((error, xmlOutput) => {
    if (error) {
      return res.status(500).json({ error: 'Error executing AS400 command', details: error });
    }

    // Parsing XML output
    const parser = new XMLParser();
    const result = parser.parse(xmlOutput);

    // Mengirimkan response dalam bentuk JSON
    res.json(result);
  });
});

// Menjalankan server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
