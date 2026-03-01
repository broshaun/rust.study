import React, { useMemo, useState, useRef, useEffect } from ".store/react@18.3.1/node_modules/react";
import styles from "./UserChat.module.css";

const DEFAULT_AVATAR = "/favicon.png";
const DEFAULT_EDIT_ICON = "🖊️";
const SAVE_ICON = "✔";
const CANCEL_ICON = "✖";

const UserChat = ({ friendData = {}, children, onClose }) => {
  const childComponents = useMemo(() => {
    const components = { avatar: null, textList: [], buttonList: [] };

    React.Children.forEach(children, (child, index) => {
      if (!React.isValidElement(child)) return;
      const componentType = child.type._componentType || (child.type.displayName || "").toLowerCase();

      if (componentType === "avatar") {
        components.avatar = child;
      } else if (componentType === "text") {
        components.textList.push({
          key: index,
          props: child.props,
          children: String(child.props.children ?? "").trim(),
          isEditable: !!child.props.onConfirm,
          icon: DEFAULT_EDIT_ICON,
        });
      } else if (componentType === "button") {
        components.buttonList.push(child);
      }
    });
    return components;
  }, [children]);

  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState("");
  const editInputRef = useRef(null);

  useEffect(() => {
    if (editingKey !== null) {
      const item = childComponents.textList.find(x => x.key === editingKey);
      if (item) setEditValue(item.children);
      editInputRef.current?.focus();
    }
  }, [editingKey, childComponents.textList]);

  const handleOpenEdit = (key) => setEditingKey(key);
  const handleSaveEdit = () => {
    const item = childComponents.textList.find(x => x.key === editingKey);
    if (item?.props.onConfirm) item.props.onConfirm(editValue.trim(), friendData);
    setEditingKey(null);
  };
  const handleCancelEdit = () => setEditingKey(null);

  const renderAvatar = () => {
    if (childComponents.avatar) {
      return React.cloneElement(childComponents.avatar, {
        className: styles.avatar,
        onError: (e) => (e.target.src = DEFAULT_AVATAR),
      });
    }
    return <img src={DEFAULT_AVATAR} alt="avatar" className={styles.avatar} />;
  };

  return (
    <div className={styles.container}>
      {onClose && <button className={styles.closeBtn} onClick={onClose}>×</button>}

      <div className={styles.content}>
        <div className={styles.avatarBox}>{renderAvatar()}</div>
        <div className={styles.infoPanel}>
          {childComponents.textList.map((item) => {
            const editing = item.key === editingKey;
            return (
              <div key={item.key} className={styles.textItem}>
                <span className={styles.textLabel}>{item.props.lable}：</span>

                {editing ? (
                  <div className={styles.editRow}>
                    <input
                      ref={editInputRef}
                      className={styles.smallInput}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit();
                        if (e.key === "Escape") handleCancelEdit();
                      }}
                      maxLength={20} // 新增：限制输入字符数
                      placeholder="请输入备注"
                    />
                    <div className={styles.btnGroupInline}>
                      <button className={styles.btnOk} onClick={handleSaveEdit}>{SAVE_ICON}</button>
                      <button className={styles.btnCancel} onClick={handleCancelEdit}>{CANCEL_ICON}</button>
                    </div>
                  </div>
                ) : (
                  <span
                    className={`${styles.textValue} ${item.isEditable ? styles.editable : ""}`}
                    onClick={() => item.isEditable && handleOpenEdit(item.key)}
                  >
                    {item.children || "无"}
                    {item.isEditable && <span className={styles.editIcon}>{item.icon}</span>}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.bottomBtns}>
        {childComponents.buttonList.map((btn, i) =>
          React.cloneElement(btn, {
            key: i,
            className: styles.actionBtn,
            onClick: (e) => {
              e.stopPropagation();
              btn.props.onClick?.(friendData);
            },
          })
        )}
      </div>
    </div>
  );
};

const Avatar = ({ avatarUrl, className, ...props }) => (
  <img src={avatarUrl} className={className} {...props} />
);
Avatar.displayName = "Avatar";
Avatar._componentType = "avatar";

const Text = () => null;
Text.displayName = "Text";
Text._componentType = "text";

const Button = ({ lable, color, ...props }) => (
  <button style={{ backgroundColor: color, color: "#fff" }} {...props}>{lable}</button>
);
Button.displayName = "Button";
Button._componentType = "button";

UserChat.Avatar = Avatar;
UserChat.Text = Text;
UserChat.Button = Button;

export default UserChat;