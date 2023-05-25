import Head from 'next/head';
import { Autocomplete, Box, Button, Container, Input, selectClasses, TextField, Typography } from '@mui/material';
import { DashboardLayout } from '../components/dashboard-layout';
// import Autocomplete from 'react-autocomplete';
import { useCallback, useEffect, useMemo, useState } from 'react';
import axiosInstance from '../lib/config';
import { Card, Col, Modal, Row } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import moment from 'moment';
import { PictureAsPdf } from '@mui/icons-material';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jsPDF';
import converter from 'number-to-words'
import { toast, ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';


const Page = () => {
const [selected, setSelected] = useState({dept: null, session: null, batch: null, program: null, semester: null})
const [course, setCourse] = useState({name: null, instructor: null,  code: null , creditHour: {total: null, theory: 0, practical: 0}})
const [totalMarks, setTotalMarks] = useState({mid: null, sessional: null, practical: null, final: null})
const [loadData, setLoadData] = useState(false)
const [students, setStudents] = useState([])
const [faculty, setFaculty] = useState([])
const [showRepeaters, setShowRepeaters] = useState(false)
const [repeater, setRepeater] = useState({id: null, label: null, selected: false})
const [previousModal, setPreviousModal] = useState({show: false, data: [], search: null})
// const [consoleData, setConsoleData] = useState([])
// const [dataRepeaters, setDataRepeaters] = useState([])
const [selectedRows, setSelectedRows] = useState([]);
const [toggleCleared, setToggleCleared] = useState(false);
const [data, setData] = useState([])
// const data = [] // regular students

  useEffect( () => {
    const getData = async () => {
      try{
        const studentRes = await axiosInstance.get('/students')
        const facultyRes = await axiosInstance.get('/faculty')
        setStudents(studentRes.data.data)
        setFaculty(facultyRes.data.data)
      }catch(err){
        alert(err)
      }
    }
    getData()
  }, [])

  const loadDataHandler = () => {
    // if(!(selected.dept && selected.session && selected.batch && selected.program && selected.semester && course.instructor && course.name && course.code && course.creditHour.total)){
    //   alert("Please Provide All the Required Data.")
    // }
    students.map(x => {
      if(x.dept === selected.dept && x.degree === selected.program && x.session === selected.session && x.batch === selected.batch)
      data.push({
        id: x._id,
        name: x.name,
        regno: x.regno,
        mid: 0,
        sessional: 0,
        practical: 0,
        final: 0,
        total: 0,
        remarks: '',
        status: 'regular'
      })
    })
    setLoadData(true)
  }

  const saveNowProceedLater = async () => {
    try{
      const rows = data
      const {dept, program, session, batch, semester} = selected
      const {instructor, code: courseCode, name: courseTitle, creditHour} = course
      const { mid: midTotal, sessional: sessionalTotal, practical: practicalTotal, final: finalTotal} = totalMarks
  
      if(!(dept && program && session && batch && semester && instructor && courseCode)){
        return alert('Please Select the data to continue.')
      }
      const response = await axiosInstance.post('/admin/saveRecord', {
        rows, dept, program, session, batch, semester, instructor, courseCode, courseTitle, creditHour, midTotal, sessionalTotal, practicalTotal, finalTotal
      })
      
      console.log('responseData', response.data);
      toast.info(response.data.message)

    }catch(err){
      toast.error(err?.response?.data?.message)
    }
  }

  const showPreviousModal = async () => {
    try{
      const response = await axiosInstance.get('/admin/records')
      //  console.log(response.data);
      setPreviousModal({show: true, data: response.data.data})

    }catch(err){
      alert(JSON.stringify(err.response.data.message))
    }
  }

  const SaveNProceed = () => {
    if(!data.length){
      return toast.warning('Cannot Proceed Empty')
    }
    Swal.fire({
      title: 'Are You Sure To Save The Record?',
      text: "You can still be able to edit the data.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Save it'
    }).then((result) => {
      if (result.isConfirmed) {
        try{
          // Save Record isCompleted to True
          // Rerender the Screen
          // Make Result Screen

        }catch(err){
          toast.error(err?.response?.data?.message)
        }

        Swal.fire(
          'Saved',
          'Data is Successfully Saved.',
          'success'
        )
      }
    })
  }

  const previousModelLoadData = (id) => {
    previousModal.data.filter(x => x._id === id).map(x => {
      setSelected({dept: x.dept, batch: x.batch, session: x.session, program: x.program, semester: x.semester})
      setCourse({code: x.courseCode, instructor: x.instructor, name: x.courseTitle, creditHour: x.creditHour})
      setTotalMarks({mid: x.midTotal, sessional: x.sessionalTotal, practical: x.practicalTotal, final: x.finalTotal})
      setLoadData(true)
      setData(x.rows)
      const isRepeaters = x.rows.filter(x => x.status === 'repeater')
      if(isRepeaters.length){
        setShowRepeaters(true)
      }else{
        setShowRepeaters(false)
      }
      setPreviousModal({show: false})
      toast.success('Data Loaded Successfully')
    })
    
  }

  const addRepeater = useCallback(() => {
    students.map(x => {
      if(x._id === repeater.id){
        data.push({
          id: x._id,
          name: x.name,
          regno: x.regno,
          mid: 0,
          sessional: 0,
          practical: 0,
          final: 0,
          total: 0,
          remarks: '',
          status: 'repeater'
        })
        }
      })
    // students.map(x => {
    //   if(x._id === repeater.id){
    //     setDataRepeaters([...dataRepeaters, {
    //       id: x._id,
    //       name: x.name,
    //       regno: x.regno,
    //       status: 'repeater'
    //     }]) 
    //   }
    // })
    setRepeater({id: null, label: null, selected: false})
  }, [repeater.id])

  const handleRowSelected = useCallback(state => {
		setSelectedRows(state.selectedRows);
	}, []);

  let headers = [
    {label: 'Reg-No', key: 'regno'},
    {label: 'Name', key: 'name'},
    {label: 'Mid', key: 'mid'},
    {label: 'Sessional', key: 'sessional'},
    {label: 'Practical', key: 'practical'},
    {label: 'Final', key: 'final'},
    {label: 'Total', key: 'total'},
    {label: 'Remarks', key: 'remarks'},
  ]

  const generate = () => {
      const doc = new jsPDF("landscape", "pt", "letter");
      var img = new Image();
      var src = "https://jobzalert.pk/admissions/inst-logo/Ghazi-University-D-G-Khan-admissions.jpg";
      img.src = src;

      const columns = [];
      //making dynamic header
      headers.filter(head => head.key === 'practical' ? course.creditHour.practical > 0 : true).map((key) => columns.push({ header: key.label }));
      let rows = [];

      if(course.creditHour.practical > 0){
        data.filter(x => x.status === 'regular').map((key) =>
        rows.push(
          Object.values([
          key.regno,
          key.name,
          key.mid,
          key.sessional,
          key.practical,
          key.final,
          key.total,
          key.remarks
          ])
        )
      );
      }else{
        data.filter(x => x.status === 'regular').map((key) =>
        rows.push(
          Object.values([
          key.regno,
          key.name,
          key.mid,
          key.sessional,
          key.final,
          key.total,
          key.remarks
          ])
        )
      );
      }

      doc.addImage(img, "JPEG", 650, 35, 90, 55);
      doc.setFontSize(22);
      doc.setFont('Roboto', 'bold', '600')
      doc.text(230, 25, `Ghazi University, Dera Ghazi Khan`)
      doc.setFontSize(10);
      doc.text(530, 35, `Course Result`)
      doc.text(650, 25, `Dated: ${moment().format('DD/MM/YYYY')}`)
      
      let x = 50, y = 52
      doc.setFontSize(11);
      // Row 1
      doc.text(x, y, `Dept: ${selected.dept}`);
      doc.text(x+=100, y, `Program: ${selected.program}`);
      doc.text(x+=120, y, `Session: ${selected.session}`);
      doc.text(x+=130, y, `Batch: ${selected.batch}`);
      // Row 2
      doc.text(x = 50, y+=17, `Semester: ${selected.semester}`);
      doc.text(x+=100, y, `Course Title: ${course.name}`);
      doc.text(x+=250, y, `Course-Code: ${course.code}`);
      doc.text(x+=130, y, `Cr.Hr: ${course.creditHour.total}(${course.creditHour.theory}-${course.creditHour.practical})`);
      // Row 3
      doc.text(x = 50, y+=17, `Instructor: ${course.instructor}`);

      autoTable(doc, {
        theme: 'grid',
        margin: { top: 100 },
        styles: {
          halign: 'center'
         },  
        columnStyles: {
          0: { halign: "left" },
          1: { halign: 'left' },
          2: { halign: 'center' },
          3: { halign: 'center' },
          4: { halign: 'center' },
          5: { halign: 'center' },
          6: { halign: 'center' },
          7: { halign: 'center' },
          
        },    
        didDrawPage: data => {
          data.settings.margin.top = 18
        },
      
        columns: columns,
        body: rows,
      })

      // Repeaters
      rows = [];
     if(course.creditHour.practical > 0){
        data.filter(x => x.status === 'repeater').map((key) =>
        rows.push(
          Object.values([
          key.regno,
          key.name,
          key.mid,
          key.sessional,
          key.practical,
          key.final,
          key.total,
          key.remarks
          ])
        )
        );    
     }else{
        data.filter(x => x.status === 'repeater').map((key) =>
        rows.push(
          Object.values([
          key.regno,
          key.name,
          key.mid,
          key.sessional,
          key.final,
          key.total,
          key.remarks
          ])
        )
        );      
     }


      if(rows.length){
        autoTable(doc, {
          theme: 'striped',
          columns: ['Repeaters'],
          body: [],
        })
        autoTable(doc, {
          theme: 'striped',
          margin: { top: -50 },
          styles: {
            halign: 'center'
           },  
          columnStyles: {
            0: { halign: "left" },
            1: { halign: 'left' },
            2: { halign: 'center' },
            3: { halign: 'center' },
            4: { halign: 'center' },
            5: { halign: 'center' },
            6: { halign: 'center' },
            7: { halign: 'center' },
          },          
          columns: columns,
          body: rows,
        })
      }
   
      
      const pageCount = doc.internal.getNumberOfPages();
      for (var i = 1; i <= pageCount; i++) {
        // Go to page i
        doc.setPage(i);
        doc.text(
          String(i) + "/" + String(pageCount),
          420 - 20,
          623 - 30,
          null,
          null,
          "center"
        );
        
        if(i === pageCount){
          // last page
          doc.text(
            `Course Instructor__________________`,
            150,
            623 - 50,
            null,
            null,
            "center"
          );
          doc.text(
            `Incharge/HOD__________________`,
            630,
            623 - 50,
            null,
            null,
            "center"
          );
        }

      }
      
      // doc.setFontSize(10);
      // doc.text(30, 755, "Assigned By___________________");
      // doc.text(420, 755, "Approved by___________________");
      
      doc.save("MarkingConsole.pdf");
  }


  const contextActions = useMemo(() => {
		const handleDelete = () => {
			if (window.confirm(`Are you sure you want to delete:\r ${selectedRows.map(r => r.name)}?`)) {
        // console.log("selectedRows",selectedRows);
				setToggleCleared(!toggleCleared);
        selectedRows.map(r => {
          setData(data.filter(x => x.id !== r.id))
        })
			}
		};

		return (
			<Button key="delete" onClick={handleDelete} color='error' variant='contained' >
				Delete
			</Button>
		);
	}, [selectedRows, toggleCleared]);


  let uniqueDepts = [...new Set(students.map(students => students.dept))]
  let uniqueProgram = [...new Set(students.map(students => students.dept === selected.dept && students.degree))]
  let uniqueSessions = [...new Set(students.map(students => students.dept === selected.dept && students.degree === selected.program && students.session))]
  let uniqueBatch = [...new Set(students.map(students => students.dept === selected.dept && students.degree === selected.program && students.session === selected.session && students.batch))]
  let Semester = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']
  let facultyList = faculty.map(faculty =>  { return {name: faculty.name, regno: faculty.regno}})
  let AllStudentsWithRegno = students.filter(student => 
    (student.dept !== selected.dept && student.degree !== selected.program && student.session !== selected.session && student.batch !== selected.batch))
    .map(student => {
    return {
      label: student.regno + ' - ' + student.name + ' - ' + student.degree + ' - ' + student.session + ' (' + student.batch + ')',
      key: student._id
    }
  })

  const setRowValue = (value, row, name) => {
    setData(
      data.map(x => {
      if(row.id === x.id){
        const total = ((name === 'mid') && (parseFloat(value) + parseFloat(x.sessional) + (x.practical && parseFloat(x.practical)) + parseFloat(x.final))) ||
                      ((name === 'sessional') && (parseFloat(x.mid) + parseFloat(value) + (x.practical && parseFloat(x.practical)) + parseFloat(x.final)))  ||
                      ((name === 'practical') && (parseFloat(x.mid) + parseFloat(x.sessional) + parseFloat(value) + parseFloat(x.final))) ||
                      ((name === 'final') && (parseFloat(x.mid) + parseFloat(x.sessional) + (x.practical && parseFloat(x.practical)) + parseFloat(value)))
        return {
          ...x,
          [name] : value,
          total,
          remarks: `${converter.toWords(total).toUpperCase()} ${total > 0 ? 'ONLY' : ''}`   
        }
      }else{
        return{
          ...x
        }
      }      
    })
    )

    
    
  }

  const columns = [
    {
        name: 'Reg-No',
        selector: row => row.regno,
    },
    {
        name: 'Name',
        width: '250px',
        selector: row => row.name,
    },
    {
      name: 'Mid',
      center: true,
      selector: row => {
        return(
          <Input type='number' inputProps={{step: 1, min:0, max: totalMarks.mid ?? undefined}} value={row.mid} onChange={(e) => setRowValue(e.target.value, row, 'mid')} sx={{width: 40, textAlign: 'center'}} />
        )
      }
    },
    {
      name: 'Sessional',
      selector: row => {
        return(
          <Input type='number' inputProps={{step: 1, min:0, max: totalMarks.sessional ?? undefined}} value={row.sessional} onChange={(e) => setRowValue(e.target.value, row, 'sessional')} sx={{width: 40, textAlign: 'center'}} />
        )
      }
    },
    {
      name: 'Practical',
      selector: row => {
        return(
          (course.creditHour.practical && course.creditHour.practical > 0) ?
          <Input type='number' inputProps={{step: 1, min:0, max: totalMarks.practical ?? undefined}} value={row.practical} onChange={(e) => setRowValue(e.target.value, row, 'practical')} sx={{width: 40, textAlign: 'center'}} /> : null
        )
      }
    },
    {
      name: 'Final',
      selector: row => {
        return(
          <Input type='number' inputProps={{step: 1, min:0, max: totalMarks.final ?? undefined}} value={row.final} onChange={(e) => setRowValue(e.target.value, row, 'final')} sx={{width: 40, textAlign: 'center'}} />
        )
      }
    },
    {
      name: 'Total',
      selector: row => {
        return(
          <Input type='number' inputProps={{step: 1, min:0, max: totalMarks.mid + totalMarks.sessional + totalMarks.practical + totalMarks.final}} value={row.total} sx={{width: 40, textAlign: 'center'}} />
        )
      }
    },
    {
      name: 'Remarks',
      width: '160px',
      selector: row => row.remarks.toUpperCase()
        // return(
        //   <Input type='text' sx={{width: 60, textAlign: 'center'}} />
        // )
      
    }
  ];

  const customStyles = {
    rows: {
        style: {
           
        },
    },
    headCells: {
        style: {
            backgroundColor: "#514E4E",
            color: 'White'
        },
    },
    cells: {
        style: {
          
        },
    },
};


  return (
    <>
    <ToastContainer />
      <Head>
        <title>
          Marking Console | GravityHub
        </title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 3
        }}
      >
        <Modal size='lg' show={previousModal.show} onHide={() => setPreviousModal({show: false})} >
          <Modal.Header> Total Records: {previousModal.data && previousModal.data.length}
            <Input type='text' placeholder='Search in Records' value={previousModal.search} onChange={(e) => setPreviousModal({...previousModal, search: e.target.value})} />  
          </Modal.Header>
          <Modal.Body>
            {previousModal.data && previousModal.data
            .filter(x => (previousModal.search && previousModal.search !== '') ? (x.dept.toLowerCase().includes(previousModal.search.toLowerCase()) 
            || x.program.toLowerCase().includes(previousModal.search.toLowerCase()) 
            || x.session.toLowerCase().includes(previousModal.search.toLowerCase())
            || x.semester.toLowerCase().includes(previousModal.search.toLowerCase())
            || x.batch.toLowerCase().includes(previousModal.search.toLowerCase())
            || x.instructor.toLowerCase().includes(previousModal.search.toLowerCase())
            || x.courseCode.toLowerCase().includes(previousModal.search.toLowerCase())
            || x.courseTitle.toLowerCase().includes(previousModal.search.toLowerCase())
            ) : x)
            .map(x => <>
              <Card className='my-2' id={x._id}>
                <Card.Header>{x.program + ' - ' + x.semester + `(${x.batch}) By `} <b>{x.instructor}</b></Card.Header>
                <Card.Body>
                  <Card.Title>{x.courseCode + ' ~ ' + x.courseTitle}</Card.Title>
                  <Card.Text>
                    Record Updated: {moment(x.updatedAt).format('MMMM Do YYYY, h:mm:ss a')}
                  </Card.Text>
                  <Button variant="primary" onClick={() => previousModelLoadData(x._id)}>Load Data</Button>
                </Card.Body>
              </Card>
            </>)}
          </Modal.Body>
          <Modal.Footer>
          <Button variant="secondary" onClick={() => setPreviousModal({show: false})}> Close </Button>
          </Modal.Footer>
        </Modal>

        <Container maxWidth="lg">
        <Row className='mb-4'>
             <Button onClick={showPreviousModal} className='bg-dark' variant='contained' sx={{width: "100%"}}>Load Previous Data</Button> 
          </Row>
          <Row className='my-2'>
              <Col> 
                <Autocomplete
                disabled={loadData}
                disablePortal
                id="combo-box"
                options={uniqueDepts}
                value={selected.dept}
                sx={{ width: 200 }}
                onChange={(event, newValue) => {
                  setSelected({dept: newValue});
                }}
                renderInput={(params) => <TextField {...params} label="Department" />}
                />
              </Col>

              <Col>
              <Autocomplete
                disabled={loadData}
                disablePortal
                id="combo-box"
                options={uniqueProgram}
                value={selected.program}
                sx={{ width: 200 }}
                onChange={(event, newValue) => {
                  setSelected({...selected, program: newValue, session: '', batch: ''});
                }}
                renderInput={(params) => <TextField {...params} label="Program" />}
              />
              </Col>

             <Col>
              <Autocomplete
                disabled={loadData}
                disablePortal
                id="combo-box"
                options={uniqueSessions}
                value={selected.session}
                sx={{ width: 200 }}
                onChange={(event, newValue) => {
                  setSelected({...selected, session: newValue, batch: ''});
                }}
                renderInput={(params) => <TextField {...params} label="Session" />}
              />
              </Col>

              <Col>
                <Autocomplete
                  disabled={loadData}
                  disablePortal
                  id="combo-box"
                  options={uniqueBatch}
                  value={selected.batch}
                  sx={{ width: 200 }}
                  onChange={(event, newValue) => {
                    setSelected({...selected, batch: newValue});
                  }}
                  renderInput={(params) => <TextField {...params} label="Batch" />}
                />
              </Col>

              <Col>
                <Autocomplete
                  disabled={loadData}
                  disablePortal
                  id="combo-box"
                  options={Semester}
                  value={selected.semester}
                  sx={{ width: 200 }}
                  onChange={(event, newValue) => {
                    setSelected({...selected, semester: newValue});
                  }}
                  renderInput={(params) => <TextField {...params} label="Semester" />}
                />
              </Col>
          </Row> 
          <Row className='my-2'>
              <Col> 
                <Autocomplete
                disablePortal
                id="combo-box"
                options={facultyList.map(x => x.name)}
                value={course.instructor}
                sx={{ width: 250 }}
                onChange={(event, newValue) => {
                  setCourse({...course, instructor: newValue})
                }}
                renderInput={(params) => <TextField {...params} label="Instructor" />}
                />
              </Col>
              <Col>
                    <TextField focused value={course.code} onChange={(e) => setCourse({...course, code: e.target.value})} className='mx-2' id="standard-basic" label="Course Code"  variant="standard" sx={{width: 100}}  />
              </Col>
              <Col>
               <TextField focused value={course.name} onChange={(e) => setCourse({...course, name: e.target.value})} className='mx-2' id="standard-basic" label="Course Title"  variant="standard" sx={{width: 250}}  />
              </Col>
              <Col>
              <TextField focused value={course.creditHour.total} onChange={(e) => setCourse({...course, creditHour: { ...course.creditHour, total: e.target.value, theory: e.target.value}})} className='mx-1' type='number' id="standard-basic" label="Credit Hours"  variant="standard" sx={{width: 100}}  />              
              </Col>
              <Col>
                  <Row>
                    <TextField focused value={course.creditHour.theory} onChange={(e) => setCourse({...course, creditHour: { ...course.creditHour, theory: e.target.value}})} className='mx' type='number' id="standard-basic" label="Thoery"  variant="standard" sx={{width: 70}}  />
                    <TextField focused value={course.creditHour.practical} onChange={(e) => setCourse({...course, creditHour: { ...course.creditHour, practical: e.target.value}})} className='mx' type='number' id="standard-basic" label="Practical"  variant="standard" sx={{width: 70}}  />
                  </Row>
              </Col>
          </Row> 
          <Row>
             <Col>
                <TextField focused type='number' value={totalMarks.mid} onChange={(e) => setTotalMarks({...totalMarks, mid: e.target.value})} className='mx-2' id="standard-basic" label="Mid"  variant="standard" sx={{width: 150}}  />
             </Col>
             <Col>
                <TextField focused type='number' value={totalMarks.sessional} onChange={(e) => setTotalMarks({...totalMarks, sessional: e.target.value})} className='mx-2' id="standard-basic" label="Sessional"  variant="standard" sx={{width: 150}}  />
             </Col>
             {(course.creditHour.practical && course.creditHour.practical > 0) ? <Col>
                <TextField focused type='number' value={totalMarks.practical} onChange={(e) => setTotalMarks({...totalMarks, practical: e.target.value})} className='mx-2' id="standard-basic" label="Practical"  variant="standard" sx={{width: 150}}  />
             </Col> : null }
             <Col>
                <TextField type='number' value={totalMarks.final} onChange={(e) => setTotalMarks({...totalMarks, final: e.target.value})} className='mx-2' id="standard-basic" label="Final"  variant="standard" sx={{width: 150}} focused />
             </Col>
             <Col>
                <Button onClick={loadData ? saveNowProceedLater : loadDataHandler} variant='outlined' color='primary'>{loadData ? 'Save Now Proceed Later' : 'Load Data'}</Button>
             </Col>
          </Row>
          <Row className='mt-3'>
            <DataTable 
              className='mb-5'
                title={`Regular Students (${data.filter(x => x.status === 'regular').length})`}
                columns={ columns}
                data={loadData ? data.filter(x => x.status === 'regular') : []}
                pagination
                fixedHeader
                fixedHeaderScrollHeight={"75vh"}
                defaultPageSize={100}
                theme='black'
                customStyles={customStyles}
                direction="auto"
                responsive
                subHeaderWrap
                highlightOnHover
            />  
          </Row>

          {!showRepeaters &&
          <Row className='my-5'>
             <Button onClick={() => setShowRepeaters(true)} variant='contained' sx={{width: "100%"}}>Add Repeaters</Button> 
          </Row>
          }
          {showRepeaters && 
          <>
            <Row className='mt-5'>
              <Col> 
                  <Autocomplete
                  disablePortal
                  options={AllStudentsWithRegno}
                  value={repeater.label}
                  sx={{ width: '100%' }}
                  onChange={(event, newValue) => {
                    if(newValue){
                      setRepeater({ id: newValue.key, label: newValue.label, selected: true});
                    }else{
                      setRepeater({ id: null, selected: false});
                    }
                    
                  }}
                  renderInput={(params) => <TextField {...params} label="Search Student" />}
                  />
                </Col>
                <Col>
                  <Button variant='outlined' size='large' onClick={addRepeater} disabled={!repeater.selected}>Add Student</Button>
                </Col>
            </Row>

            <Row className='my-3'>
              <DataTable 
                className='mb-5'
                title={`Repeaters (${data.filter(x => x.status === 'repeater').length})`}
                columns={ columns}
                data={showRepeaters ? data.filter(x => x.status === 'repeater') : []}
                pagination
                fixedHeader
                fixedHeaderScrollHeight={"72vh"}
                defaultPageSize={100}
                theme='black'
                customStyles={customStyles}
                direction="auto"
                responsive
                subHeaderWrap
                highlightOnHover
                selectableRows
                selectableRowsSingle
                contextActions={contextActions}
                onSelectedRowsChange={handleRowSelected}
                clearSelectedRows={toggleCleared}
            />
            </Row>
          </> }
          <Row className='mt-5'>
             <Button onClick={generate} color='info' variant='outlined' sx={{width: "50%"}}><PictureAsPdf color='info'/> Download PDF</Button> 
          </Row>
          <Row  className='my-3'>
             <Button onClick={SaveNProceed} color='secondary' variant='contained' sx={{width: "100%"}}>Proceed & Save Record</Button> 
          </Row>
        </Container>
      </Box>
    </>
  );
  
}


Page.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Page;
