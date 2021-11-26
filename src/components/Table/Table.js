import styles from './Table.module.css';
import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import { useSpring, animated, useTransition } from "react-spring";

const Cell = (props) => {
    const { className, children, ...rest } = props;

    return (
        <div className={props.className} {...rest}>
            {props.children}
        </div>
    )
}

const Filter = (props) => {
    // const style = useTransition({
    //     from: { opacity: 0, x: -200 },
    //     enter: { opacity: 1, x: 0 },
    //     leave: { opacity: 0, x: -200 },
    //     config: { friction: 10, tension: 30 },
    // })

    const style = useSpring({
        from: { opacity: 0, x: -200 },
        to: { opacity: 1, x: 0 },
        config: { friction: 10, tension: 30 },
    });
    const filters = ['=', 'contains']
    const headers = Object.keys(props.data[0]);
    const [filterEquation, setFilterEquation] = useState({ value: filters[0] });
    const [selectedHeader, setselectedHeader] = useState({ value: headers[0] });
    const [filterText, setFilterText] = useState('');

    const handleHeader = (e) => {
        setselectedHeader({ value: e.target.value });
    }

    const handleFilterEquation = (e) => {
        setFilterEquation({ value: e.target.value });
    }

    const handleFilterText = (e) => {
        setFilterText(e.target.value);
    }

    useEffect(() => {
        props.getFilterValue({
            header: selectedHeader.value,
            equation: filterEquation.value,
            filter: filterText,
            id: props.id
        });
    }, [filterText, selectedHeader, filterEquation])

    // const filterData = (selectedHeader, filterEquation, filterText) => {
    //     let filterFunction = () => {}
    //     if (filterEquation === '=') {
    //         filterFunction = (o) => { return o[selectedHeader] == filterText }
    //     }
    //     else if (filterEquation === 'contains') {
    //         filterFunction = (o) => { return o[selectedHeader].toString().toLowerCase().indexOf(filterText.toLowerCase()) > -1 }
    //     }

    //     console.log(_.filter(props.data, filterFunction)); // return this to parent
    // }

    return (
        <animated.div style={style} className={styles['filter-wrapper']}>
            <select className={styles['filter-select']} value={selectedHeader.value} onChange={handleHeader}>
                {headers.map((header, key) => {
                    return (
                        <option key={key} value={header}>{header}</option>
                    )
                })}
            </select>
            <select className={styles['filter-select']} value={filterEquation.value} onChange={handleFilterEquation}>
                {filters.map((filter, key) => {
                    return (
                        <option key={key} value={filter}>{filter}</option>
                    )
                })}
            </select>

            <input className={styles['filter-field']} value={filterText} onChange={handleFilterText} type="text" placeholder="Filter" />
            {/* <button className={styles['filter-button']} onClick={() => filterData(selectedHeader.value, filterEquation.value, filterText)}>Filter</button> */}
        </animated.div>
    )
}


const Table = (props) => {
    const [filterArray, setFilterArray] = useState([]);
    const [filterObjects, setFilterObjects] = useState([]);
    const tableData = props.data;
    const style = useSpring({
        from: { opacity: 0, x: -200 },
        to: { opacity: 1, x: 0 },
        config: { friction: 10, tension: 30 },
    });
    const columnHeaders = Object.keys(tableData[0]);
    const [data, setData] = useState(tableData);
    let sortList = {};

    columnHeaders.forEach(header => {
        return sortList[header] = 'asc'
    })

    const [currentSort, setCurrentSort] = useState(sortList);

    const sortHandler = (sortTarget) => {
        setCurrentSort(({ [sortTarget]: val, ...rest }) => {
            return {
                [sortTarget]: val === 'asc' ? 'desc' : 'asc',
                ...rest,
            }
        })
    }

    const getSortList = () => {
        let headers = []
        let sortType = []

        for (const [key, value] of Object.entries(currentSort)) {
            headers.push(key)
            sortType.push(value)
        }

        return [headers, sortType]
    }

    const sortData = () => {
        const [headers, sortType] = getSortList()
        const newData = _.orderBy(data, headers, sortType)
        setData(newData);
    }

    const handleSort = (sortTarget) => {
        sortHandler(sortTarget)
    }

    useEffect(() => {
        sortData()
    }, [currentSort])

    const handleFilter = (operation) => {
        console.log('filter', filterArray)
        if (operation === '+') {
            setFilterArray((prev) => [...prev, true])
        } else {
            setFilterArray((prev) => [...prev].slice(0, -1))
            setFilterObjects((prev) => [...prev].slice(0, -1))
        }
    };

    const getFilterValue = (object) => {
        setFilterObjects((prev) => {
            prev[object.id] = object
            return [...prev]
        })

        console.log(filterObjects)
        // let filterFunction = () => {}
        // if (filterEquation === '=') {
        //     filterFunction = (o) => { return o[selectedHeader] == filterText }
        // }
        // else if (filterEquation === 'contains') {
        //     filterFunction = (o) => { return o[selectedHeader].toString().toLowerCase().indexOf(filterText.toLowerCase()) > -1 }
        // }

        // console.log(_.filter(props.data, filterFunction)); 
    }

    const FilterData = () => {
        filterObjects.forEach(object => {
            const {filter, equation, header} = object
            let filterFunction = () => {}
            if (equation === '=') {
                filterFunction = (o) => { return o[header] == filter }
            }
            else if (equation === 'contains') {
                filterFunction = (o) => { return o[header].toString().toLowerCase().indexOf(filter.toLowerCase()) > -1 }
            }

            console.log('filtered Array: ',_.filter(data, filterFunction));

            setData(_.filter(data, filterFunction)); 
        });
    }

    return (
        <animated.div className={styles['table-wrapper']} style={style}>
            <div className={styles['button-wrapper']}>
                <button className={styles['filter-control']} onClick={() => handleFilter('+')}>+</button>
                <button className={styles['filter-control']} onClick={() => handleFilter('-')}>-</button>
                <button className={styles['filter-button']} onClick={FilterData}>Filter</button>
            </div>
            {filterArray.map((filter, key) => {
                return filter && <Filter getFilterValue={getFilterValue} id={key} key={key} data={data} />
            })}
            <table className={styles.table}>
                <tbody className={styles['table-body']}>
                    <tr className={styles.row} >
                        {columnHeaders.map((header, key) => {
                            return (
                                <td key={key} className={styles['row-item']} onClick={() => handleSort(header)}>{header}
                                    <div className={styles.sort}>{currentSort[header] === 'asc' ? '<' : '>'}</div>
                                </td>
                            )
                        })}
                    </tr>

                    {data.map((cell) => {
                        return (
                            <tr key={cell.id} className={styles.row}>
                                {columnHeaders.map((header, key) => {
                                    return (
                                        <Cell key={key} className={`${styles['row-item']} ${styles['line-count-5']}`} item={cell}>{cell[header]}</Cell>
                                    )
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </animated.div>
    )
}

export default Table;