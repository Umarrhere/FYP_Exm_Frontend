import Head from 'next/head';
import { Box, Container } from '@mui/material';
import { StudentsList } from '../components/registration/students-list';
import { StudentsHeader } from '../components/registration/students-header';
import { DashboardLayout } from '../components/dashboard-layout';
import { customers } from '../__mocks__/customers';
import { useEffect, useState } from 'react';
import axiosInstance from '../lib/config';
import { Row, Col , Tab, Tabs } from 'react-bootstrap';
import { FacultyHeader } from '../components/registration/faculty-header';
import { FacultyList } from '../components/registration/faculty-list';




const Page = () => {
  const [students, setStudents] = useState([])
  const [faculty, setFaculty] = useState([])
  const [studentSearch, setStudentSearch] = useState('')
  const [facultySearch, setFacultySearch] = useState('')


  useEffect( () => {
    const getStudents = async () => {
      try{
        const studentRes = await axiosInstance.get('/students')
        const facultyRes = await axiosInstance.get('/faculty')
        setStudents(studentRes.data.data)
        setFaculty(facultyRes.data.data)
      }catch(err){
        alert(err)
      }
    }
    getStudents()
  }, [])

  let AllStudent = students.filter(x => x.name.toLowerCase().includes(studentSearch.toLowerCase()) || x.regno.toLowerCase().includes(studentSearch.toLowerCase()))
  let AllFaculty = faculty.filter(x => x.name.toLowerCase().includes(facultySearch.toLowerCase()) || x.regno.toLowerCase().includes(facultySearch.toLowerCase()))

  // console.log("AllStudent", AllStudent);
  
  
  return(
    <>
    <Head>
      <title>
        Registration | GravityHub
      </title>
    </Head>
    <Row>
      <Col>
        <Tabs
        defaultActiveKey="students"
        id="uncontrolled-tab-example"
        className="mt-3"
      >
          <Tab eventKey={'students'} key={1} title="Students" className='p-2' open>
            <div className="d-flex justify-content-center">
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  py: 1
                }}
              >
                <Container maxWidth={false}>
                  <StudentsHeader students={AllStudent} searchText={studentSearch} onSearchTextChange={setStudentSearch} />
                  <Box sx={{ mt: 2 }}>
                    <StudentsList students={AllStudent} />
                  </Box>
                </Container>
              </Box>
            </div>
          </Tab>
          
          <Tab eventKey={'faculty'} key={2} title="Faculty" className='p-2'>
            <div className="d-flex justify-content-center">
                <Box
                  component="main"
                  sx={{
                    flexGrow: 1,
                    py: 1
                  }}
                >
                  <Container maxWidth={false}>
                    <FacultyHeader faculty={AllFaculty} searchText={facultySearch} onSearchTextChange={setFacultySearch}/>
                    <Box sx={{ mt: 2 }}>
                      <FacultyList faculty={AllFaculty} />
                    </Box>
                  </Container>
                </Box>
              </div>
          </Tab>

        </Tabs>
      </Col>       
    </Row>
  </>
  )

}


Page.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Page;
