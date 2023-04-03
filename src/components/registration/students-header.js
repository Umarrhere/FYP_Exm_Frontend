import {
  Box,
  Button,  
  Input,  
  SvgIcon, Typography
} from '@mui/material';
import { Upload as UploadIcon } from '../../icons/upload';
import { Download as DownloadIcon } from '../../icons/download';
import { useEffect, useRef, useState } from 'react';
import {read, utils} from 'xlsx'
import axiosInstance from '../../lib/config';
import { CSVLink } from 'react-csv';
import { Col, Form, Modal, Row } from 'react-bootstrap';
import toastr from 'toastr';


export const StudentsHeader = ({students, searchText, onSearchTextChange}) => {
  const [file, setFile] = useState([]);
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const inputRef = useRef(null)

  const handleChange = e => {
    setFile([e.target.files[0]]);
  }

 const submitFile = async () => {
  try{
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
          const wb = read(event.target.result);
          const sheets = wb.SheetNames;
          let studentSheet = sheets.indexOf("Sheet1");
          if (studentSheet != -1) {
            const rows = utils.sheet_to_json(wb.Sheets[sheets[studentSheet]]);
            // console.log(rows);
            const res = await axiosInstance.post('/students/import', {importData: rows})
            toastr.clear()
            toastr.info(res.data.message)
            console.log("Result", res.data.message);
           }
       };
      reader.readAsArrayBuffer(file[0]);
    } else {
     console.log("Here Outside");
    }

  }catch(err){

  }
}

  let headers = [
    { label: "name", key: "name" },
    { label: "regno", key: "regno" },
    { label: "session", key: "session" },
    { label: "dept", key: "dept" },
    { label: "degree", key: "degree" },
    { label: "batch", key: "batch" },
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
        Students
      </Typography>

      <Box sx={{ m: 1 }}>
        <Input type='text' value={searchText} onChange={(e) => onSearchTextChange(e.target.value)} placeholder='Search Student'/>
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
            data={students}
            filename={"Students.csv"}   
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
          onClick={handleShow}
        >
          Add Students
        </Button>
      </Box>

      <Modal show={show} onHide={handleClose} backdrop={'static'} size={'lg'}>
          <Modal.Header closeButton>
            <Modal.Title>Add Student</Modal.Title>
          </Modal.Header>
          <Modal.Body>
              <Form>
              <Row className="mb-3">
                <Form.Group as={Col} controlId="formGridEmail">
                  <Form.Label>Name</Form.Label>
                  <Form.Control type="text" name="name" placeholder="i.e. John Doe ..." />
                </Form.Group>

                <Form.Group as={Col} controlId="formGridPassword">
                  <Form.Label>Reg-No</Form.Label>
                  <Form.Control type="text" name="registration" placeholder="i.e. 2019gu07 ..." />
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as = {Col} controlId="formGridAddress1">
                  <Form.Label>Session</Form.Label>
                  <Form.Control name="session" placeholder="i.e. 2019-2023" />
                </Form.Group>

                <Form.Group as = {Col} controlId="formGridAddress2">
                  <Form.Label>Department</Form.Label>
                  <Form.Control name="dept" placeholder="i.e. CS&IT" />
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} controlId="formGridCity">
                  <Form.Label>Degree</Form.Label>
                  <Form.Control name="degree" placeholder="i.e. BSIT" />
                </Form.Group>


                <Form.Group as={Col} controlId="formGridZip">
                  <Form.Label>Batch</Form.Label>
                  <Form.Control name="batch" placeholder="i.e. Morning" />
                </Form.Group>
              </Row>

              <Form.Group className="mb-3" id="formGridCheckbox">
                <Form.Check type="checkbox" label="Confirmation" />
              </Form.Group>

              <Button variant="primary" color='primary'>
                Submit
              </Button>
        </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button color='primary' variant="primary" onClick={handleClose}>
              Save Changes
            </Button>
          </Modal.Footer>
       </Modal>  
    </Box>
  )

}
  
