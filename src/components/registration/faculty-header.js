import {
    Box,
    Button,  
    Input,  
    SvgIcon, Typography
  } from '@mui/material';
  import { Upload as UploadIcon } from '../../icons/upload';
  import { Download as DownloadIcon } from '../../icons/download';
  import { useRef, useState } from 'react';
  import {read, utils} from 'xlsx'
  import axiosInstance from '../../lib/config';
import { CSVLink } from 'react-csv';
  
  
  export const FacultyHeader = ({faculty, searchText, onSearchTextChange}) => {
    const [file, setFile] = useState([]);
    const inputRef = useRef(null)
  
    const handleChange = e => {
      setFile([e.target.files[0]]);
    }
  
   const submitFile = async () => {
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
            const wb = read(event.target.result);
            const sheets = wb.SheetNames;
            let facultySheet = sheets.indexOf("Sheet1");
            if (facultySheet != -1) {
              const rows = utils.sheet_to_json(wb.Sheets[sheets[facultySheet]]);
              console.log(rows);
              const res = await axiosInstance.post('/faculty/import', {importData: rows})
              console.log("Result", res.data);
             }
         };
        reader.readAsArrayBuffer(file[0]);
      } else {
       console.log("Here Outside");
      }
    };
  
    let headers = [
      { label: "name", key: "name" },
      { label: "regno", key: "regno" },
      { label: "dept", key: "dept" },
      { label: "joined", key: "joined" },
    ];
  
    return (
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          m: -1
        }}
      >
        <Typography
          sx={{ m: 1 }}
          variant="h4"
        >
          Faculty
        </Typography>
        <Box sx={{ m: 1 }}>
        <Input type='text' value={searchText} onChange={(e) => onSearchTextChange(e.target.value)} placeholder='Search Faculty'/>
          <Button
            onClick={() => inputRef.current.click()}
            startIcon={(<UploadIcon fontSize="small" />)}
            sx={{ mr: 1 }}
          >
            Import
          </Button>
          <input type='file' accept='.xlsx' id='upload-file' ref={inputRef} onChange={handleChange}/>
          
          {file.length > 0 && 
            <Button onClick={submitFile}>
               Submit
           </Button>
          }
          
          <CSVLink
            headers={headers}
            data={faculty}
            filename={"Faculty.csv"}   
          >
            <Button
              startIcon={(<DownloadIcon fontSize="small" />)}
              sx={{ mr: 1 }}
            >
              Export
            </Button>
         </CSVLink>

          <Button
            color="primary"
            variant="contained"
          >
            Add Faculty
          </Button>
        </Box>
      </Box>
    )
  
  }
    
  