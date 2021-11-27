import styles from './Table.module.css';
import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useSpring, animated } from "react-spring";

const Cell = (props) => {
    const { className, children, ...rest } = props;

    return (
        <td className={props.className} {...rest}>
            {props.children}
        </td>
    )
}

const Selector = (props) => {
    const { className, defaultOption, handler = () => {}, options = [] } = props;

    return (
        <select className={className} value={defaultOption} onChange={handler}>
            {options.map((option, key) => {
                return (
                    <option key={key} value={option}>{option}</option>
                )
            })}
        </select>
    )
}

const Pagination = (props) => {
    const { className, options = [[10, 20], 20] } = props;
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState({ value: options[1] });

    const handleChangePage = (event, newPage) => {
        setCurrentPage(newPage);
    };

    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage({ value: e.target.value });
        setCurrentPage(1);
    };

    return (
        <div className={styles['pagination-wrapper']}>
            <p>Rows Per Page: </p>
            <Selector className={className} defaultOption={rowsPerPage.value} options={options[0]} handler={handleChangeRowsPerPage}/>
        </div>
    )
}

const Filter = (props) => {
    const style = useSpring({
        from: { opacity: 0, y: -50 },
        to: { opacity: 1, y: 0 },
        config: { friction: 10, tension: 30 },
    });
    const filters = ['=', 'contains', '>', '<'];

    const headers = props.data

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
    }, [filterText, selectedHeader, filterEquation]);

    return (
        <animated.div style={style} className={styles['filter-wrapper']}>
            <Selector className={styles['filter-select']} defaultOption={selectedHeader.value} handler={handleHeader} options={headers}/>
            <Selector className={styles['filter-select']} defaultOption={filterEquation.value} handler={handleFilterEquation} options={filters}/>
            <input className={styles['filter-field']} value={filterText} onChange={handleFilterText} type="text" placeholder="Filter..." />
        </animated.div>
    )
}

const Table = (props) => {
    const [filterArray, setFilterArray] = useState([]);
    const [filterObjects, setFilterObjects] = useState([]);
    const tableData = props.data;
    const style = useSpring({
        delay: 500,
        from: { opacity: 0, x: -50 },
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

    const sortData = (dataObject = data) => {
        const [headers, sortType] = getSortList()
        const newData = _.orderBy(dataObject, headers, sortType)
        setData(newData);
    }

    useEffect(() => {
        sortData()
    }, [currentSort])

    const handleSort = (sortTarget) => {
        sortHandler(sortTarget)
    }

    const handleFilter = (operation) => {
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
    }

    const FilterData = () => {
        let tempData = tableData;
        filterObjects.forEach(object => {
            const { filter, equation, header } = object
            let filterFunction = () => { }
            if (equation === '=') {
                filterFunction = (o) => { return o[header] == filter }
            }
            else if (equation === 'contains') {
                filterFunction = (o) => { return o[header].toString().toLowerCase().indexOf(filter.toLowerCase()) > -1 }
            }
            else if (equation === '>') {
                filterFunction = (o) => { return o[header] > filter }
            } 
            else if (equation === '<') {
                filterFunction = (o) => { return o[header] < filter }
            }

            tempData = _.filter(tempData, filterFunction)
        });

        setData(tempData);
        sortData(tempData);
    }

    return (
        <animated.div className={styles['table-wrapper']} style={style}>
            <div className={styles['button-wrapper']}>
                <button className={`${styles['filter-button']} ${styles['filter-control']}`} onClick={() => handleFilter('+')}>+</button>
                <button className={`${styles['filter-button']} ${styles['filter-control']}`} onClick={() => handleFilter('-')}>-</button>
                <button className={styles['filter-button']} onClick={FilterData}>Filter</button>
            </div>
            {filterArray.map((filter, key) => {
                return filter && <Filter getFilterValue={getFilterValue} id={key} key={key} data={columnHeaders} />
            })}

            <Pagination className={styles['pagination-select']} options={props.rowsPerPage}/>
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
            {/* <Pagination className={styles['pagination-select']} options={props.rowsPerPage}/> */}
        </animated.div>
    )
}

export default Table;