import styles from './Table.module.css';
import tableData from './dummyData';

const Table = (props) => {
    const columnHeaders = Object.keys(tableData[0]);

    console.log(columnHeaders);


    return (
        <div className={styles['table-wrapper']}>
            <table className={styles.table}>
                <tbody className={styles['table-body']}>
                    {columnHeaders.map((header, key) => {
                        return (
                            <tr key={key} className={styles.column} >
                                <td className={styles['row-item']}>{header}</td>
                                <td className={styles['row-item']}>asadsadasdsa</td>
                                <td className={styles['row-item']}>bbbbbbbbb</td>
                                <td className={styles['row-item']}>ccccccc</td>
                                <td className={styles['row-item']}>ddddddd</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default Table;