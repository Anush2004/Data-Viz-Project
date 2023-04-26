import * as d3 from "d3";
import Slider from '@mui/material/Slider';
import * as React from 'react';
import './aidPolitics.css'
import Box from '@mui/material/Box';
import Loading from './loading';
import Button from '@mui/material/Button';
import { useNavigate } from "react-router-dom";
import Tree from 'react-d3-tree';
import CircularProgress from '@mui/material/CircularProgress';
import Header from "../partials/Header";

const datasetLink = "https://raw.githubusercontent.com/FlightVin/Data-Viz-Labs/main/calamity-dataset.csv";
export default function AidPolitics(props) {
    const [yearRange, setYearRange] = React.useState([1900, 2023]);
    const [data, setData] = React.useState(null);
    const [isLoading, setLoading] = React.useState(true);
    const [changeState, setChangeState] = React.useState(true);
    const [treeData, setTreeData] = React.useState({});
    const [vizLoading, setVizLoading] = React.useState(false);
    const navigate = useNavigate();

    const navigateTo = (route) => {
        return function() {
            navigate(route+"/"+yearRange[0]+"/"+yearRange[1]);
        }
    }

    React.useEffect(() => {
        setTimeout(() => {
            d3.csv(datasetLink)
                .then(res => {
                    setData(res);
                    setLoading(false);
                })
        }, 1000);
    }, []);

    const drawAidPolitics = () => {
        
        const yesSvg = d3.select('#yes-svg');
        yesSvg.selectAll('*').remove();
        const noSvg = d3.select('#no-svg');
        noSvg.selectAll('*').remove();

        const checkDate = (d) => {
            return Number(d['Start Year']) >= yearRange[0] && Number(d['Start Year']) <= yearRange[1];
        }

        var yesData = data.filter(d => d['Appeal'] === 'Yes' && checkDate(d));
        var noData = data.filter(d => d['Appeal'] === 'No' && checkDate(d));

        // getting set of continents
        const continentSet = new Set();
        data.forEach(d => {
            continentSet.add(d['Continent']);
        })
        const continentArray = [];
        continentSet.forEach(d => {
            continentArray.push(d);
        });
        // console.log(continentArray);

        // making scales
        var color = d3.scaleOrdinal()
            .domain(continentArray)
            .range(d3.schemeSet1);

        const countrySet = new Set();
        yesData.forEach(d => {
            countrySet.add(d['Country']);
        })
        var countryArray = [];
        countrySet.forEach(d => {
            countryArray.push({Country: d, AidCalls: []});
        })
        yesData.forEach(d => {
            countryArray.forEach(cData => {
                if (cData['Country'] === d['Country']){
                    cData['AidCalls'].push(d.Year);

                    // adding continent
                    cData['Continent'] = d['Continent']
                }
            })
        })
        function compareByName(a, b) {
            const nameA = a.Country.toUpperCase(); 
            const nameB = b.Country.toUpperCase(); 
            if (nameA < nameB) {
              return -1;
            }
          
            if (nameA > nameB) {
              return 1;
            }
                      return 0;
        }

        countryArray.sort(compareByName)
        
        /*
            data in countryArray
                AidCalls -  array of years in which they appealed for aid
                Continent
                Country
        */

        // formatting tree data from countryArray
        const curYesTreeData = {
            name: 'Yes',
            children: [],
        };

        // adding subdivision of continents
        continentArray.forEach(c => {
            curYesTreeData.children.push({
                name: c,
                children: [],
            })
        })

        // pushing contries onto the object
        countryArray.forEach(d => {
            curYesTreeData.children.forEach(continent => {
                if (continent.name === d.Continent){
                    const yearArray = [];
                    d['AidCalls'].forEach(y => {
                        yearArray.push({
                            name: y,
                        })
                    })

                    continent.children.push({
                        name: d.Country.slice(0, 14),
                        children: yearArray,
                    })
                }
            })
        })

        // doing the same for no data
        countryArray = []
        countrySet.forEach(d => {
            countryArray.push({Country: d, AidCalls: []});
        })
        noData.forEach(d => {
            countryArray.forEach(cData => {
                if (cData['Country'] === d['Country']){
                    cData['AidCalls'].push(d.Year);

                    // adding continent
                    cData['Continent'] = d['Continent']
                }
            })
        })

        // formatting tree data from countryArray
        const curNoTreeData = {
            name: 'No',
            children: [],
        };

        // adding subdivision of continents
        continentArray.forEach(c => {
            curNoTreeData.children.push({
                name: c,
                children: [],
            })
        })

        // pushing contries onto the object
        countryArray.forEach(d => {
            curNoTreeData.children.forEach(continent => {
                if (continent.name === d.Continent){
                    const yearArray = [];
                    d['AidCalls'].forEach(y => {
                        yearArray.push({
                            name: y,
                        })
                    })

                    continent.children.push({
                        name: d.Country.slice(0, 14),
                        children: yearArray,
                    })
                }
            })
        })

        const curTreeData = {
            name: 'Appealed for aid?',
            children:[
                curYesTreeData,
                curNoTreeData
            ]
        }

        setTreeData(curTreeData);
    }

    React.useEffect(() => {
        setVizLoading(true);
        setTimeout(() => {
            if (!isLoading) drawAidPolitics();
            setVizLoading(false);
        }, 1000);
    }, [changeState, isLoading]);


    if (isLoading) {
        return (
            <Loading />
        );
    }

    const handleYearChange = (event, newValue) => {
        setYearRange(newValue);
    }

    const yearRangeText = (value) => {
        return `${value}`;
    }

    const handleViz = () => {
        setChangeState(d => !d);
    }

    return (
        <>
            <Header/>
            <main
                style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                padding: '20px',
                }}
            >
                <p
                    style={{
                        marginTop:'100px'
                    }}
                id="vineeth_heading"
                >
                    International Aid Visualization: Select Range of Years
                </p>
                <p>
                    <Box sx={{ width: 500 }}
                    data-aos="zoom-in" data-aos-delay="300"
                    >
                        <Slider
                            getAriaLabel={() => 'Year range'}
                            value={yearRange}
                            onChange={handleYearChange}
                            valueLabelDisplay="auto"
                            getAriaValueText={yearRangeText}
                            disableSwap
                            step={1}
                            min={1900}
                            max={2023}
                        /> 
                    </Box>
                </p>

                <div style={{display: 'flex', justifyContent: 'space-between'}}
                    data-aos="zoom-in" data-aos-delay="400"
                >
                    <Button variant="outlined" onClick={handleViz}>Visualize</Button> 
                    <Button variant="contained" onClick={navigateTo('/aid-politics-yes')
                    }
                    style={{
                        marginLeft:'30px'
                    }}

                    >Map View for only appeals</Button>
                </div>


                <div className="visual-div" style={{ width: '1400px', height: '900px' }}>
                    {
                        !vizLoading ? 
                            <Tree 
                                data={treeData} 
                                separation= {{ nonSiblings: 0.5, siblings: 0.3 }}    
                                translate={{x:500, y:300}}
                                depthFactor={200}
                                rootNodeClassName="node__root"
                                branchNodeClassName="node__branch"
                                leafNodeClassName="node__leaf"
                            />
                        :
                            <CircularProgress />
                    }
                    
                </div>
            </main>
        </>
    );
}