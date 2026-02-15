import React, { useState, useEffect, useMemo } from 'react';
import { SimpleSelect } from 'components';
import { useHttpClient } from 'hooks';

export const Address = ({ label, onChange, defaultValue }) => {
    const full = defaultValue ? String(defaultValue) : '';
    const provinceDefault = full ? full.slice(0, 2) : '';

    const { http: http1 } = useHttpClient('/api/friend/address/province/');
    const { http: http2 } = useHttpClient('/api/friend/address/city/');

    const [options1, setOptions1] = useState();
    const [options2, setOptions2] = useState();
    const [payload2, setPayload2] = useState();

    // 省份
    useEffect(() => {
        http1.requestParams('GET').then(({ code, data }) => {
            if (code === 200) setOptions1(data);
        });
    }, [http1]);

    // 初始化：根据 defaultValue 拉对应城市列表
    useEffect(() => {
        if (provinceDefault) setPayload2({ province_code: provinceDefault });
    }, [provinceDefault]);

    // 城市
    useEffect(() => {
        if (!payload2?.province_code) return;
        http2.requestParams('GET', payload2).then(({ code, data }) => {
            if (code === 200) setOptions2(data);
        });
    }, [http2, payload2]);

    const handleProvinceChange = (code) => {
        setPayload2({ province_code: code });
    };

    return (
        // 核心：外层 flex 容器，实现同行展示、容不下换行
        <div style={{
            display: 'flex',
            flexWrap: 'wrap', // 关键：容不下时自动换行
            gap: '16px', // 两个组件之间的间距，可自定义（如 12px、20px）
            width: '100%', // 适配父级宽度，可选
            boxSizing: 'border-box',
            padding: '0', // 可根据布局调整
        }}>
            <SimpleSelect
                key={`p-${provinceDefault}-${options1?.length || 0}`}
                label={label}
                options={options1 || []}
                defaultValue={provinceDefault}
                onChange={handleProvinceChange}
                style={{
                    minWidth: '160px', // 最小宽度，避免被挤压过小，可自定义
                    flex: 1, // 可选：让组件平分剩余宽度，更灵活
                }}
            />

            <SimpleSelect
                key={`c-${full}-${options2?.length || 0}`}
                options={options2 || []}
                defaultValue={full}
                onChange={onChange}
                style={{
                    minWidth: '160px', // 最小宽度，和第一个组件保持一致，美观
                    flex: 1, // 可选：让组件平分剩余宽度，更灵活
                }}
            />
        </div>
    );
};