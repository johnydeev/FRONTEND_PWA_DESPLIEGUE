import { useEffect, useState } from "react";
import { RiArrowDownSLine, RiMenu5Line } from "react-icons/ri";
import { BiEdit } from "react-icons/bi";
import { BsChatText } from "react-icons/bs";
import { MdOutlineHeadphones } from "react-icons/md";
import { VscSend } from "react-icons/vsc";
import useApiRequest from "../../hooks/useApiRequest";
import ENVIROMENT from "../../config/environment";
import "./Channels.css";
import { useForm } from "../../hooks/useForm";
import { handleError, ServerError } from "../../Utils/error.utils";
import ChannelsList from "../ChannelsList/ChannelsList";

const Channels = ({ workspace, onChannelSelect }) => {
    const { name: workspaceName, _id: workspace_id, channels } = workspace;

    const formInitialState = {
        name: "",
    };
    const { formState, handleOnChange } = useForm(formInitialState);
    const [channelList, setChannelList] = useState(channels || []);

    const { postRequest } = useApiRequest(
        `${ENVIROMENT.URL_API}/api/channels/${workspace_id}`
    );

    const [activeItem, setActiveItem] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const handleActiveItem = (index) => setActiveItem(index);
    const toggleChannelDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    const token = JSON.parse(sessionStorage.getItem("authorization_token"));

    const handleCreateChannel = async (e) => {
        try {
            e.preventDefault();
            
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };
            console.log("FormState en channels: ", formState);

            const response = await postRequest({
                name: formState.name,
                headers,
            });
            console.log("Response Api en CHANNELS:", response);
            if (!response) {
                throw new ServerError(
                    "Error al obtener respuesta de la API",
                    500
                );
            }

            setChannelList((prevState) => {
                return [...prevState, response.data.new_channel];
            });
            toggleChannelDropdown();
        } catch (error) {
            console.log("Error al crear un canal", error);
            handleError(error);
        }
    };
    useEffect(() => {}, [formState]);

    return (
        <>
            <div className="channels-header">
                <button className="workspace-btn">
                    {workspaceName} <RiArrowDownSLine />
                </button>

                <button className="channels-edit-btn">
                    <BiEdit />
                </button>
            </div>

            <div className="channels-list">
                <div className="channels-list-sections">
                    {[
                        {
                            icon: <BsChatText />,
                            label: "Hilos de conversaciones",
                        },
                        { icon: <MdOutlineHeadphones />, label: "Juntas" },
                        { icon: <VscSend />, label: "Borradores y enviados" },
                    ].map((item, index) => (
                        <div
                            key={index}
                            className={
                                activeItem === index ? "active-item" : ""
                            }
                            onClick={() => handleActiveItem(index)}
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>
                <ChannelsList
                    onChannelSelect={onChannelSelect}
                    channelList={channelList}
                    toggleChannelDropdown={toggleChannelDropdown}
                />
            </div>

            {/* Dropdown para crear canal */}
            {isDropdownOpen && (
                <div className="dropdown-container">
                    <h4>Crear Canal</h4>
                    <form onSubmit={handleCreateChannel}>
                        <input
                            type="text"
                            name="name"
                            placeholder="Nombre del canal"
                            value={formState.name}
                            onChange={handleOnChange}
                        />
                        <div className="dropdown-actions">
                            <button type="submit">Crear</button>
                            <button
                                type="button"
                                onClick={toggleChannelDropdown}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default Channels;

// const { userState } = useContext(AuthContext);
// const { getWorkspaces } = useContext(WorkspaceContext);

// useEffect(() => {
//     if (userState._id) {
//         getWorkspaces();
//     }
// }, [userState._id]);
