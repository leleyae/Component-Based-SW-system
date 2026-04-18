from uuid import UUID, uuid4
from typing import Optional
from models.designer import DesignerCreate, DesignerUpdate, DesignerResponse


# In-memory store for development — replace with SQLAlchemy session in Task 6
_store: dict[UUID, dict] = {}


class DesignerController:
    def create(self, payload: DesignerCreate) -> DesignerResponse:
        designer_id = uuid4()
        record = {
            "id": designer_id,
            "name": payload.name,
            "style": payload.style,
            "email": payload.email,
            "bio": payload.bio,
            "portfolio_url": payload.portfolio_url,
        }
        _store[designer_id] = record
        return DesignerResponse(**record)

    def list_all(self) -> list[DesignerResponse]:
        return [DesignerResponse(**r) for r in _store.values()]

    def get_by_id(self, designer_id: UUID) -> Optional[DesignerResponse]:
        record = _store.get(designer_id)
        if not record:
            return None
        return DesignerResponse(**record)

    def update(
        self, designer_id: UUID, payload: DesignerUpdate
    ) -> Optional[DesignerResponse]:
        record = _store.get(designer_id)
        if not record:
            return None
        update_data = payload.model_dump(exclude_unset=True)
        record.update(update_data)
        _store[designer_id] = record
        return DesignerResponse(**record)

    def delete(self, designer_id: UUID) -> bool:
        if designer_id not in _store:
            return False
        del _store[designer_id]
        return True
