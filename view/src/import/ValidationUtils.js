

export const CheckStudentCell = (col, val) => {
    if (col === 'index' || col === 'valid') {
        return ''
    }
    // check for columns
    else if (val) {
        return '';
    }
    else {
        return 'Empty';
    }
    
} 

export const CheckParentCell = (col, val) => {
    
} 

export const CheckStudentRow = (row) => {
    console.log(row)
    
    for (const [key, value] of Object.entries(row)) {
        let m = CheckStudentCell(key, value)
        if (m) {
            console.log(key, value)
            return m;
        }
    }  
    return ''; 
} 

export const CheckParentRow = (row) => {
    
} 