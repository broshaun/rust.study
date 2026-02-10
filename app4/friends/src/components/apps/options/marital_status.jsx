import React, { useState, useEffect } from 'react';
import { SimpleSelect } from 'components';
import { useHttpClient } from 'hooks';



// 下拉选项
const selectOptions = [
    { value: 1, label: '选择一' },
    { value: 2, label: '选择二' },
    { value: 3, label: '选择三' },
];

export const MaritalStatus = ({
    onChange,
}) => {
    const [options, setOptions] = useState();
    const { http } = useHttpClient('/api/report/dataset/')

    useEffect(() => {
        let sql = `SELECT options_value as value,options_label as label FROM public.dictionary WHERE organize='marital_status'`
        http.requestBodyJson('POST', { 'pgsql': sql }).then(
            (results) => {
                const { code, data } = results
                if (code === 200) {
                    setOptions(data)
                }
            })
    }, [])



    return <SimpleSelect label='婚姻状态:' options={options} onChange={onChange} />

}