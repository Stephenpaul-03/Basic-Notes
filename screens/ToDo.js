import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Alert,
  ToastAndroid,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Icon from "react-native-ico-dazzle-line";

const ToDo = () => {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [originalTask, setOriginalTask] = useState("");

  const showToast = (message) => {
    ToastAndroid.showWithGravity(
      message,
      ToastAndroid.SHORT,
      ToastAndroid.CENTER
    );
  };

  const handleAddTask = () => {
    if (task.trim() === "") {
      showToast("Task cannot be empty");
      return;
    }

    if (editIndex !== -1) {
      const updatedTasks = [...tasks];
      updatedTasks[editIndex] = {
        ...updatedTasks[editIndex],
        name: task,
      };
      setTasks(updatedTasks);
      setEditIndex(-1);
    } else {
      setTasks([...tasks, { id: Date.now().toString(), name: task, completed: false }]);
    }

    setTask("");
    setIsModalVisible(false);
  };

  const handleEditTask = (index) => {
    const taskToEdit = tasks[index].name;
    setOriginalTask(taskToEdit);
    setTask(taskToEdit);
    setEditIndex(index);
    setIsModalVisible(true);
  };

  const handleDeleteTask = (index) => {
    Alert.alert("Confirmation", "Are you sure you want to delete this task?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: () => {
          const updatedTasks = [...tasks];
          updatedTasks.splice(index, 1);
          setTasks(updatedTasks);
        },
      },
    ]);
  };

  const handleCompleteTask = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    setTasks(updatedTasks);
  };

  const handleCloseModal = () => {
    if (editIndex !== -1 && task !== originalTask) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Do you want to discard them?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            onPress: () => {
              setIsModalVisible(false);
              setTask("");
              setEditIndex(-1);
            },
          },
        ]
      );
    } else {
      setIsModalVisible(false);
    }
  };

  const resetTextInput = () => {
    setTask("");
    setEditIndex(-1);
    setIsModalVisible(true);
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => handleEditTask(index)}
      onLongPress={() => handleDeleteTask(index)}
    >
      <View style={styles.task}>
        <TouchableOpacity onPress={() => handleCompleteTask(index)}>
          <Icon
            name={item.completed ? "square-check" : "square"}
            height="30"
            width="30"
            padding="0"
            style={styles.Markbutton}
          />
        </TouchableOpacity>
        <Text
          style={[
            styles.itemList,
            item.completed && styles.completed,
            styles.TaskText,
          ]}
        >
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );


  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="" />
      <Text style={styles.header}>Tasks</Text>
      <TouchableOpacity
        style={styles.ModalButton}
        onPress={() => resetTextInput()}
      >
        <Icon name="plus" height="30" width="30" color="white" />
      </TouchableOpacity>
      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={handleCloseModal}
      >
        <TouchableOpacity
          style={styles.modalBackground}
          activeOpacity={1}
          onPressOut={handleCloseModal}
        >
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter task"
                  value={task}
                  onChangeText={(text) => setTask(text)}
                />
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddTask}
                >
                  <Text style={styles.AddText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFF",
  },
  header: {
    fontSize: 40,
    fontWeight: '300',
    textAlign: "left",
    marginTop: 10,
    marginBottom: 15,
    paddingLeft: 10,
    color: "#333",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    paddingLeft: 15,
    marginRight: 10,
    borderRadius: 5,
    fontSize: 18,
    height: 50,
  },
  ModalButton: {
    backgroundColor: "grey",
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  modalContent: {
    flexDirection: "row",
    alignItems: "center",
    width: '100%',
    borderRadius: 5,
  },
  addButton: {
    height: 50,
    width: 80,
    borderRadius: 5,
    backgroundColor: 'grey',
    justifyContent: "center",
    alignItems: "center",
  },
  AddText: {
    color: "white",
    fontSize: 18,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 10,
    width: "95%",
    borderRadius: 10,
    alignSelf: 'center',
  },
  task: {
    flexDirection: "row",
    alignItems: "center",
    fontSize: 22,
    backgroundColor: "#DCE2EC",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  itemList: {
    fontSize: 18,
    fontWeight: "300",
    paddingHorizontal: 10,
  },
  Markbutton:{
    padding:0,
  },
  TaskText:{
    flexWrap:'wrap',
    maxWidth:"90%"
  },
  completed: {
    textDecorationLine: "line-through",
    color: "grey",
  },
});

export default ToDo;
