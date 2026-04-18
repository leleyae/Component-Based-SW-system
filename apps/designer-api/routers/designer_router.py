from fastapi import APIRouter, HTTPException
from uuid import UUID
from controllers.designer_controller import DesignerController
from models.designer import DesignerCreate, DesignerUpdate, DesignerResponse

router = APIRouter()
controller = DesignerController()


@router.post("/", response_model=DesignerResponse, status_code=201)
def create_designer(payload: DesignerCreate):
    return controller.create(payload)


@router.get("/", response_model=list[DesignerResponse])
def list_designers():
    return controller.list_all()


@router.get("/{designer_id}", response_model=DesignerResponse)
def get_designer(designer_id: UUID):
    designer = controller.get_by_id(designer_id)
    if not designer:
        raise HTTPException(status_code=404, detail="Designer not found")
    return designer


@router.put("/{designer_id}", response_model=DesignerResponse)
def update_designer(designer_id: UUID, payload: DesignerUpdate):
    designer = controller.update(designer_id, payload)
    if not designer:
        raise HTTPException(status_code=404, detail="Designer not found")
    return designer


@router.delete("/{designer_id}", status_code=204)
def delete_designer(designer_id: UUID):
    deleted = controller.delete(designer_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Designer not found")
