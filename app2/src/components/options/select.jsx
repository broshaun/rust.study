import { SimpleSelect } from 'components';



export const SimpleSelect2 = ({
  onChange,
}) => {

  // 下拉选项
  const selectOptions = [
    { value: 1, label: '选择一' },
    { value: 2, label: '选择二' },
    { value: 3, label: '选择三' },
  ];


  return <SimpleSelect label='选项:' options={selectOptions} onChange={onChange} />

}